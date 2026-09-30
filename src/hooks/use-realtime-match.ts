// ═══════════════════════════════════════════════════════════
// Realtime Match Hook — polling fallback (no Supabase)
// ═══════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, useCallback } from "react";
import type { MatchEvent } from "@/lib/types";

/**
 * Polls for match events instead of using Supabase realtime.
 * Falls back gracefully when Supabase is not configured.
 */
export function useRealtimeMatch(matchId: string) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestScores, setLatestScores] = useState<Record<string, number>>({});

  const fetchEvents = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(`/api/matches/${matchId}/events`);
      if (res.ok) {
        const data = await res.json() as MatchEvent[];
        setEvents(data);
        const scores: Record<string, number> = {};
        for (const event of data) {
          if (event.event_type === "score_update" && event.player_id && event.new_score !== null) {
            scores[event.player_id] = event.new_score!;
          }
        }
        setLatestScores(scores);
        setIsConnected(true);
      }
    } catch {
      setIsConnected(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [matchId, fetchEvents]);

  return { events, isConnected, latestScores };
}
