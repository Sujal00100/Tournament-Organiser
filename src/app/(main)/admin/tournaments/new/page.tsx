"use client";

import { useActionState } from "react";
import { createTournament } from "@/actions/tournaments";
import { ROUTES, TOURNAMENT_FORMAT_LABELS } from "@/lib/constants";
import { Trophy, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionResponse, Tournament } from "@/lib/types";

export default function NewTournamentPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResponse<Tournament>, FormData>(
    createTournament,
    { success: false }
  );

  useEffect(() => {
    if (state.success && state.data) {
      router.push(ROUTES.ADMIN_TOURNAMENT(state.data.id));
    }
  }, [state, router]);

  // Default dates
  const now = new Date();
  const regOpen = new Date(now.getTime() + 60 * 60 * 1000); // +1h
  const regClose = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3d
  const startDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // +4d

  const toLocalDatetime = (d: Date) =>
    d.toISOString().slice(0, 16);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.ADMIN_TOURNAMENTS}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/30 text-muted-foreground transition-all hover:bg-card/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create <span className="text-gradient-primary">Tournament</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Set up a new competitive event
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        action={formAction}
        className="space-y-8 rounded-xl border border-border/50 bg-card/30 p-6"
      >
        {/* Error display */}
        {state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {/* Basic Info */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            Basic Information
          </legend>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Tournament Name *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., Summer Championship 2026"
              className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="game_name" className="text-sm font-medium">
                Game Name *
              </label>
              <input
                id="game_name"
                name="game_name"
                type="text"
                required
                placeholder="e.g., Valorant, Chess, FIFA"
                className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="format" className="text-sm font-medium">
                Format *
              </label>
              <select
                id="format"
                name="format"
                required
                className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {Object.entries(TOURNAMENT_FORMAT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe your tournament…"
              className="w-full resize-none rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="max_participants" className="text-sm font-medium">
              Max Participants *
            </label>
            <input
              id="max_participants"
              name="max_participants"
              type="number"
              min="2"
              max="256"
              defaultValue="16"
              required
              className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </fieldset>

        {/* Schedule */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-warning" />
            Schedule
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="registration_opens_at"
                className="text-sm font-medium"
              >
                Registration Opens *
              </label>
              <input
                id="registration_opens_at"
                name="registration_opens_at"
                type="datetime-local"
                required
                defaultValue={toLocalDatetime(regOpen)}
                className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="registration_closes_at"
                className="text-sm font-medium"
              >
                Registration Closes *
              </label>
              <input
                id="registration_closes_at"
                name="registration_closes_at"
                type="datetime-local"
                required
                defaultValue={toLocalDatetime(regClose)}
                className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="starts_at" className="text-sm font-medium">
              Tournament Start *
            </label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={toLocalDatetime(startDate)}
              className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </fieldset>

        {/* Additional details */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-foreground">
            Additional Details
          </legend>

          <div className="space-y-2">
            <label htmlFor="rules" className="text-sm font-medium">
              Rules
            </label>
            <textarea
              id="rules"
              name="rules"
              rows={4}
              placeholder="Tournament rules (supports markdown)…"
              className="w-full resize-none rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prize_description" className="text-sm font-medium">
              Prize Description
            </label>
            <input
              id="prize_description"
              name="prize_description"
              type="text"
              placeholder="e.g., 1st: $500, 2nd: $250, 3rd: $100"
              className="w-full rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="seed_based"
              name="seed_based"
              type="checkbox"
              value="true"
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <label htmlFor="seed_based" className="text-sm font-medium">
              Use seeded brackets
            </label>
          </div>
        </fieldset>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-6">
          <Link
            href={ROUTES.ADMIN_TOURNAMENTS}
            className="rounded-lg border border-border/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/20 hover:text-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 glow-primary"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Creating…
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Create Tournament
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
