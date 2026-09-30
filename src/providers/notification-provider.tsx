// ═══════════════════════════════════════════════════════════
// Notification Provider
// Phase 9 implementation — stub
// ═══════════════════════════════════════════════════════════

"use client";

import { createContext, type ReactNode } from "react";

interface NotificationContextType {
  unreadCount: number;
  refreshCount: () => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

/**
 * Provides notification state (unread count) to the component tree.
 *
 * TODO: Phase 9 — implement with realtime subscription
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  return (
    <NotificationContext.Provider
      value={{ unreadCount: 0, refreshCount: () => {} }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
