"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  Users,
  Swords,
  ChevronRight,
  Info,
  DollarSign,
  Clock,
} from "lucide-react";
import { createTournamentAsPlayer } from "@/actions/tournaments";
import { SUPPORTED_GAMES, ROUTES } from "@/lib/constants";
import type { ActionResponse, Tournament } from "@/lib/types";

const INITIAL_STATE: ActionResponse<Tournament> = { success: false };

const FORMAT_OPTIONS = [
  {
    value: "single_elimination",
    label: "Single Elimination",
    desc: "Lose once and you're out. Fast and decisive.",
  },
  {
    value: "double_elimination",
    label: "Double Elimination",
    desc: "Get a second chance in the losers bracket.",
  },
  {
    value: "round_robin",
    label: "Round Robin",
    desc: "Everyone plays everyone. Best overall record wins.",
  },
];

const MAX_PLAYER_OPTIONS = [8, 16, 32, 64, 128];

function nowPlusMins(mins: number) {
  const d = new Date(Date.now() + mins * 60 * 1000);
  // Format as datetime-local value
  return d.toISOString().slice(0, 16);
}

export default function HostTournamentPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    createTournamentAsPlayer,
    INITIAL_STATE
  );

  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("single_elimination");
  const [maxPlayers, setMaxPlayers] = useState<number>(16);

  // Redirect on success
  useEffect(() => {
    if (state.success && state.data?.id) {
      router.push(ROUTES.TOURNAMENT(state.data.id));
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <p className="section-label mb-1.5">Compete</p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient-primary">Host a Tournament</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Set up your own tournament and invite players to compete. Registration opens immediately after creation.
        </p>
      </div>

      <form action={action} className="space-y-6">
        {/* Hidden fields */}
        <input type="hidden" name="game_name" value={selectedGame} />
        <input type="hidden" name="format" value={selectedFormat} />
        <input type="hidden" name="max_participants" value={maxPlayers} />

        {/* Error message */}
        {state.error && (
          <div className="animate-fade-in flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <Info className="h-4 w-4 flex-shrink-0" />
            {state.error}
          </div>
        )}

        {/* ── Game Selection ──────────────────────── */}
        <FormSection
          icon={<Swords className="h-5 w-5 text-primary" />}
          title="Choose Game"
          description="Select the game for this tournament"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SUPPORTED_GAMES.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGame(game.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${
                  selectedGame === game.id
                    ? "border-primary/60 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span className="text-2xl">{game.emoji}</span>
                <span className="text-center leading-snug">{game.name}</span>
              </button>
            ))}
          </div>
        </FormSection>

        {/* ── Tournament Info ─────────────────────── */}
        <FormSection
          icon={<Trophy className="h-5 w-5 text-primary" />}
          title="Tournament Details"
          description="Name your tournament and add a description"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                Tournament Name <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder={selectedGame ? `${selectedGame} Championship` : "My Epic Tournament"}
                className="input-field w-full"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Tell players about this tournament..."
                className="input-field w-full resize-none"
              />
            </div>

            <div>
              <label htmlFor="rules" className="mb-1.5 block text-sm font-medium text-foreground">
                Rules <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="rules"
                name="rules"
                rows={3}
                placeholder="Specific rules, map pool, server regions..."
                className="input-field w-full resize-none"
              />
            </div>
          </div>
        </FormSection>

        {/* ── Format ─────────────────────────────── */}
        <FormSection
          icon={<Swords className="h-5 w-5 text-primary" />}
          title="Format"
          description="How matches will be structured"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.value}
                type="button"
                onClick={() => setSelectedFormat(fmt.value)}
                className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                  selectedFormat === fmt.value
                    ? "border-primary/60 bg-primary/10 shadow-sm shadow-primary/10"
                    : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-muted/40"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    selectedFormat === fmt.value
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {fmt.label}
                </span>
                <span className="text-xs text-muted-foreground">{fmt.desc}</span>
              </button>
            ))}
          </div>
        </FormSection>

        {/* ── Players ─────────────────────────────── */}
        <FormSection
          icon={<Users className="h-5 w-5 text-primary" />}
          title="Max Players"
          description="Maximum number of participants allowed"
        >
          <div className="flex flex-wrap gap-3">
            {MAX_PLAYER_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxPlayers(n)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  maxPlayers === n
                    ? "border-primary/60 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </FormSection>

        {/* ── Prize ───────────────────────────────── */}
        <FormSection
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          title="Prize Pool"
          description="Describe the prize for the winner (optional)"
        >
          <input
            id="prize_description"
            name="prize_description"
            type="text"
            placeholder="e.g. ₹500 cash prize + gaming peripherals"
            className="input-field w-full"
          />
        </FormSection>

        {/* ── Schedule ─────────────────────────────── */}
        <FormSection
          icon={<Calendar className="h-5 w-5 text-primary" />}
          title="Schedule"
          description="Set registration window and tournament start time"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="registration_opens_at" className="mb-1.5 block text-sm font-medium text-foreground">
                Registration Opens <span className="text-destructive">*</span>
              </label>
              <input
                id="registration_opens_at"
                name="registration_opens_at"
                type="datetime-local"
                required
                defaultValue={nowPlusMins(0)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label htmlFor="registration_closes_at" className="mb-1.5 block text-sm font-medium text-foreground">
                Registration Closes <span className="text-destructive">*</span>
              </label>
              <input
                id="registration_closes_at"
                name="registration_closes_at"
                type="datetime-local"
                required
                defaultValue={nowPlusMins(60 * 24)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label htmlFor="starts_at" className="mb-1.5 block text-sm font-medium text-foreground">
                Tournament Starts <span className="text-destructive">*</span>
              </label>
              <input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                defaultValue={nowPlusMins(60 * 25)}
                className="input-field w-full"
              />
            </div>
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            All times are in your local timezone. Tournament starts after registration closes.
          </p>
        </FormSection>

        {/* ── Submit ──────────────────────────────── */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending || !selectedGame}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Creating...
              </>
            ) : (
              <>
                Create Tournament
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>

          {!selectedGame && (
            <p className="text-sm text-muted-foreground">
              Please select a game to continue.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
