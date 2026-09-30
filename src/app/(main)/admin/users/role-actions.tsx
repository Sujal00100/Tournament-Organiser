"use client";

import { useState, useTransition } from "react";
import { promoteToAdmin, demoteToPlayer } from "@/actions/admin";
import type { UserRole } from "@/lib/types";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";

export function UserRoleActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      if (currentRole === "player") {
        await promoteToAdmin(userId);
      } else {
        await demoteToPlayer(userId);
      }
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Sure?</span>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Yes"
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-md bg-muted/30 px-2.5 py-1 text-xs font-medium hover:bg-muted/50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        currentRole === "player"
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
      }`}
    >
      {currentRole === "player" ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          Make Admin
        </>
      ) : (
        <>
          <ShieldOff className="h-3 w-3" />
          Remove Admin
        </>
      )}
    </button>
  );
}
