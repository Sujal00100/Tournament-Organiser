// ═══════════════════════════════════════════════════════════
// User Session Hook
// Phase 2 — Full implementation with AuthProvider
// ═══════════════════════════════════════════════════════════

"use client";

import { useContext } from "react";
import { AuthContext } from "@/providers/auth-provider";

/**
 * Returns the current user session and profile from AuthContext.
 * Must be used within an AuthProvider.
 */
export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
}
