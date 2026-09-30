// ═══════════════════════════════════════════════════════════
// Realtime Notifications Hook — polling fallback (no Supabase)
// ═══════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, useCallback } from "react";
import type { Notification } from "@/lib/types";

/**
 * Polls for unread notifications instead of using Supabase realtime.
 * Falls back gracefully when Supabase is not configured.
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json() as { count: number };
        setUnreadCount(data.count ?? 0);
      }
    } catch {
      // silently fail
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [userId, fetchUnreadCount]);

  return { unreadCount, newNotifications };
}
