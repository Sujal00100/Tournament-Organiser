"use server";

// ═══════════════════════════════════════════════════════════
// Match Server Actions — MongoDB/Mongoose
// Tournament HOST (creator) can manage matches for their tournament
// ═══════════════════════════════════════════════════════════

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, MatchModel, MatchPlayerModel, UserModel, NotificationModel, newId } from "@/lib/db";
import type { ActionResponse } from "@/lib/types";
import { ROUTES } from "@/lib/constants";

// ── Auth helper: verify user is the tournament host ────────

async function requireTournamentHost(tournamentId: string) {
  const user = await getSession();
  if (!user) return { error: "Please set a username first" as const, user: null };

  await connectDB();
  const t = await TournamentModel.findById(tournamentId).lean() as { created_by?: string } | null;
  if (!t) return { error: "Tournament not found" as const, user: null };
  if (t.created_by !== user.id) return { error: "Only the tournament host can do this" as const, user: null };

  return { error: null, user };
}

// ── updateMatchScore ──────────────────────────────────────

export async function updateMatchScore(
  matchId: string,
  playerId: string,
  score: number
): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const match = await MatchModel.findById(matchId).lean() as { tournament_id?: string } | null;
  if (!match) return { success: false, error: "Match not found" };

  const { error: authError } = await requireTournamentHost(match.tournament_id!);
  if (authError) return { success: false, error: authError };

  await MatchPlayerModel.findOneAndUpdate(
    { match_id: matchId, player_id: playerId },
    { score }
  );

  revalidatePath(ROUTES.TOURNAMENT(match.tournament_id!));
  return { success: true };
}

// ── startMatch ────────────────────────────────────────────

export async function startMatch(matchId: string): Promise<ActionResponse> {
  await connectDB();
  const match = await MatchModel.findById(matchId).lean() as { tournament_id?: string; status?: string } | null;
  if (!match) return { success: false, error: "Match not found" };

  const { error } = await requireTournamentHost(match.tournament_id!);
  if (error) return { success: false, error };
  if (match.status !== "scheduled") return { success: false, error: "Match can only be started when scheduled" };

  const now = new Date().toISOString();
  await MatchModel.findByIdAndUpdate(matchId, { status: "in_progress", started_at: now, updated_at: now });

  revalidatePath(ROUTES.TOURNAMENT(match.tournament_id!));
  return { success: true };
}

// ── completeMatch ─────────────────────────────────────────

export async function completeMatch(matchId: string, winnerId: string): Promise<ActionResponse> {
  await connectDB();
  const match = await MatchModel.findById(matchId).lean() as {
    tournament_id?: string; status?: string;
    next_match_id?: string | null; loser_next_match_id?: string | null;
  } | null;
  if (!match) return { success: false, error: "Match not found" };

  const { error } = await requireTournamentHost(match.tournament_id!);
  if (error) return { success: false, error };

  if (match.status !== "in_progress" && match.status !== "scheduled") {
    return { success: false, error: "Match is not in a completable state" };
  }

  const matchPlayers = await MatchPlayerModel.find({ match_id: matchId }).lean() as Array<{
    _id: string; player_id: string; score: number; slot: number;
  }>;
  if (matchPlayers.length < 2) return { success: false, error: "Match needs 2 players" };

  const winner = matchPlayers.find((mp) => mp.player_id === winnerId);
  const loser = matchPlayers.find((mp) => mp.player_id !== winnerId);
  if (!winner || !loser) return { success: false, error: "Winner must be in this match" };

  const now = new Date().toISOString();

  // Complete the match
  await MatchModel.findByIdAndUpdate(matchId, {
    status: "completed", winner_id: winnerId, completed_at: now, updated_at: now,
  });

  // Update is_winner flags
  await MatchPlayerModel.findOneAndUpdate({ match_id: matchId, player_id: winnerId }, { is_winner: true });
  await MatchPlayerModel.findOneAndUpdate({ match_id: matchId, player_id: loser.player_id }, { is_winner: false });

  // Advance winner to next match
  if (match.next_match_id) {
    const siblings = await MatchModel.find({ next_match_id: match.next_match_id })
      .sort({ match_number: 1 }).lean() as Array<{ _id: string }>;
    const slot = siblings.length > 1 && siblings[0]._id !== matchId ? 2 : 1;
    const existing = await MatchPlayerModel.findOne({ match_id: match.next_match_id, player_id: winnerId }).lean();
    if (!existing) {
      await MatchPlayerModel.create({ _id: newId(), match_id: match.next_match_id, player_id: winnerId, slot });
    }
  }

  // Advance loser to losers bracket (double elim)
  if (match.loser_next_match_id) {
    const existing = await MatchPlayerModel.findOne({ match_id: match.loser_next_match_id, player_id: loser.player_id }).lean();
    if (!existing) {
      await MatchPlayerModel.create({ _id: newId(), match_id: match.loser_next_match_id, player_id: loser.player_id, slot: 2 });
    }
  }

  // Update player stats
  for (const mp of matchPlayers) {
    const isWinner = mp.player_id === winnerId;
    await UserModel.findByIdAndUpdate(mp.player_id, {
      $inc: { games_played: 1, games_won: isWinner ? 1 : 0 },
    });
  }

  // Send notifications
  await NotificationModel.create({
    _id: newId(), user_id: winnerId, type: "match_result",
    title: "Match Won! 🎉",
    body: `You won your match with a score of ${winner.score}-${loser.score}`,
    created_at: now,
  });
  await NotificationModel.create({
    _id: newId(), user_id: loser.player_id, type: "match_result",
    title: "Match Result",
    body: `You lost your match with a score of ${loser.score}-${winner.score}`,
    created_at: now,
  });

  revalidatePath(ROUTES.TOURNAMENT(match.tournament_id!));
  return { success: true };
}

// ── verifyMatch ───────────────────────────────────────────

export async function verifyMatch(matchId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const match = await MatchModel.findById(matchId).lean() as {
    tournament_id?: string; status?: string; admin_verified?: boolean;
  } | null;
  if (!match) return { success: false, error: "Match not found" };

  const { error } = await requireTournamentHost(match.tournament_id!);
  if (error) return { success: false, error };
  if (match.status !== "completed") return { success: false, error: "Only completed matches can be verified" };
  if (match.admin_verified) return { success: false, error: "Match is already verified" };

  const now = new Date().toISOString();
  await MatchModel.findByIdAndUpdate(matchId, {
    admin_verified: true, verified_by: user.id, verified_at: now, updated_at: now,
  });

  revalidatePath(ROUTES.TOURNAMENT(match.tournament_id!));
  return { success: true };
}

// ── scheduleMatch ─────────────────────────────────────────

export async function scheduleMatch(matchId: string, scheduledAt: string): Promise<ActionResponse> {
  await connectDB();
  const match = await MatchModel.findById(matchId).lean() as { tournament_id?: string } | null;
  if (!match) return { success: false, error: "Match not found" };

  const { error } = await requireTournamentHost(match.tournament_id!);
  if (error) return { success: false, error };

  await MatchModel.findByIdAndUpdate(matchId, { scheduled_at: scheduledAt, updated_at: new Date().toISOString() });
  revalidatePath(ROUTES.TOURNAMENT(match.tournament_id!));
  return { success: true };
}
