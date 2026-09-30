"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ChevronRight, Zap, X, CheckCircle, AlertCircle } from "lucide-react";
import { closeRegistration } from "@/actions/tournaments";
import { generateFixtures } from "@/actions/fixtures";
import { ROUTES } from "@/lib/constants";

interface HostControlsProps {
  tournamentId: string;
  status: string;
  participantCount: number;
}

export function HostControls({ tournamentId, status, participantCount }: HostControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showMsg(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function handleCloseRegistration() {
    startTransition(async () => {
      const res = await closeRegistration(tournamentId);
      if (res.success) {
        showMsg("success", "Registration closed! You can now generate fixtures.");
        router.refresh();
      } else {
        showMsg("error", res.error ?? "Something went wrong");
      }
    });
  }

  function handleGenerateFixtures() {
    startTransition(async () => {
      const res = await generateFixtures(tournamentId);
      if (res.success) {
        showMsg("success", "Fixtures generated! The bracket is ready.");
        router.refresh();
      } else {
        showMsg("error", res.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
          <Settings className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Host Controls</h3>
        <span className="ml-auto rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          YOU
        </span>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2.5">
        {status === "registration_open" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {participantCount} player{participantCount !== 1 ? "s" : ""} registered. Close registration to generate the bracket.
            </p>
            <button
              type="button"
              onClick={handleCloseRegistration}
              disabled={isPending || participantCount < 2}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm font-semibold text-warning transition-all hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-warning/30 border-t-warning" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Close Registration
            </button>
            {participantCount < 2 && (
              <p className="text-center text-xs text-muted-foreground">
                Need at least 2 players to close registration
              </p>
            )}
          </div>
        )}

        {status === "registration_closed" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {participantCount} players locked in. Generate the auto-fixture bracket now!
            </p>
            <button
              type="button"
              onClick={handleGenerateFixtures}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Generate Fixtures
            </button>
          </div>
        )}

        {status === "in_progress" && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-2.5 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-status-pulse" />
            Tournament is live! Manage matches from the bracket view.
          </div>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3.5 py-2.5 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Tournament complete. GGs to all players!
          </div>
        )}

        {(status === "registration_closed" || status === "in_progress") && (
          <a
            href={ROUTES.TOURNAMENT_BRACKET(tournamentId)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/30 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            View Bracket
            <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
