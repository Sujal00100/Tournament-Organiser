"use client";

import { Button } from "@/components/ui/button";
import { registerForTournament, withdrawFromTournament } from "@/actions/tournaments";
import { useTransition } from "react";
import { UserPlus, UserMinus, Lock } from "lucide-react";
import Link from "next/link";
import type { TournamentStatus } from "@/lib/types";

export function RegisterButton({
  tournamentId,
  canRegister,
  isRegistered,
  isFull,
  isLoggedIn,
  status,
}: {
  tournamentId: string;
  canRegister: boolean;
  isRegistered: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
  status: TournamentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link href="/login">
        <Button variant="outline" size="lg">
          <Lock className="h-4 w-4" />
          Sign in to register
        </Button>
      </Link>
    );
  }

  if (isRegistered) {
    if (status === "registration_open") {
      return (
        <Button
          variant="destructive"
          size="lg"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await withdrawFromTournament(tournamentId);
            });
          }}
        >
          <UserMinus className="h-4 w-4" />
          {isPending ? "Withdrawing..." : "Withdraw"}
        </Button>
      );
    }
    return (
      <Button variant="outline" size="lg" disabled>
        ✓ Registered
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="outline" size="lg" disabled>
        Tournament Full
      </Button>
    );
  }

  if (!canRegister) {
    return (
      <Button variant="outline" size="lg" disabled>
        Registration Closed
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="glow-primary"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await registerForTournament(tournamentId);
        });
      }}
    >
      <UserPlus className="h-4 w-4" />
      {isPending ? "Registering..." : "Register"}
    </Button>
  );
}
