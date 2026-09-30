"use client";

import { useState, useTransition } from "react";
import { updateTournamentStatus } from "@/actions/tournaments";
import { deleteTournament } from "@/actions/admin";
import { generateFixtures } from "@/actions/fixtures";
import type { TournamentStatus } from "@/lib/types";
import {
  Play,
  UserCheck,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
} from "lucide-react";

const STATUS_TRANSITIONS: Record<
  TournamentStatus,
  { label: string; nextStatus: TournamentStatus; icon: React.ReactNode; color: string; description: string }[]
> = {
  draft: [
    {
      label: "Open Registration",
      nextStatus: "registration_open",
      icon: <UserCheck className="h-4 w-4" />,
      color: "bg-success text-white hover:bg-success/90",
      description: "Players will be able to sign up for this tournament",
    },
    {
      label: "Cancel Tournament",
      nextStatus: "cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30",
      description: "Permanently cancel this tournament",
    },
  ],
  registration_open: [
    {
      label: "Close Registration",
      nextStatus: "registration_closed",
      icon: <Lock className="h-4 w-4" />,
      color: "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30",
      description: "Stop accepting new registrations",
    },
    {
      label: "Cancel Tournament",
      nextStatus: "cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30",
      description: "Cancel this tournament",
    },
  ],
  registration_closed: [
    {
      label: "Generate Fixtures",
      nextStatus: "__generate_fixtures__" as TournamentStatus,
      icon: <Zap className="h-4 w-4" />,
      color: "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30",
      description: "Auto-generate bracket/schedule from registered players",
    },
    {
      label: "Start Tournament",
      nextStatus: "in_progress",
      icon: <Play className="h-4 w-4" />,
      color: "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary",
      description: "Begin the tournament (generate fixtures first)",
    },
    {
      label: "Re-open Registration",
      nextStatus: "registration_open",
      icon: <UserCheck className="h-4 w-4" />,
      color: "bg-muted/30 text-foreground hover:bg-muted/50 border border-border/50",
      description: "Allow more players to register",
    },
    {
      label: "Cancel Tournament",
      nextStatus: "cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30",
      description: "Cancel this tournament",
    },
  ],
  in_progress: [
    {
      label: "Complete Tournament",
      nextStatus: "completed",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "bg-success text-white hover:bg-success/90",
      description: "Mark tournament as finished — all matches must be completed",
    },
  ],
  completed: [],
  cancelled: [],
};

export function TournamentStatusActions({
  tournamentId,
  currentStatus,
  participantCount,
}: {
  tournamentId: string;
  currentStatus: TournamentStatus;
  participantCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const transitions = STATUS_TRANSITIONS[currentStatus];

  if (!transitions || transitions.length === 0) return null;

  const handleAction = (nextStatus: TournamentStatus) => {
    setError(null);
    startTransition(async () => {
      let result;
      if (nextStatus === ("__generate_fixtures__" as TournamentStatus)) {
        result = await generateFixtures(tournamentId);
      } else if (nextStatus === "cancelled") {
        result = await deleteTournament(tournamentId);
      } else {
        result = await updateTournamentStatus(tournamentId, nextStatus);
      }
      if (!result.success) {
        setError(result.error ?? "Action failed");
      }
      setConfirmAction(null);
    });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold">Status Actions</h3>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {currentStatus === "registration_closed" && participantCount < 2 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Need at least 2 participants to start
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => {
          const isConfirming = confirmAction === t.nextStatus;
          const isDisabled =
            isPending ||
            (t.nextStatus === "in_progress" && participantCount < 2);

          return (
            <div key={t.nextStatus} className="relative">
              {isConfirming ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                  <span className="text-xs text-muted-foreground mr-1">
                    {t.description}?
                  </span>
                  <button
                    onClick={() => handleAction(t.nextStatus)}
                    disabled={isPending}
                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="rounded-md bg-muted/30 px-3 py-1 text-xs font-medium hover:bg-muted/50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmAction(t.nextStatus)}
                  disabled={isDisabled}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${t.color}`}
                >
                  {t.icon}
                  {t.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
