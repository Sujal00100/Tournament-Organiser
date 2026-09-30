"use server";

// ═══════════════════════════════════════════════════════════
// Fixture Generation — MongoDB/Mongoose
// Uses actual algorithm type shapes (player1/player2, nextMatchNumber/nextMatchRound)
// ═══════════════════════════════════════════════════════════

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import {
  TournamentModel, ParticipantModel, RoundModel, MatchModel, MatchPlayerModel, newId,
} from "@/lib/db";
import type { ActionResponse, TournamentFormat } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { generateSingleElimination, type BracketPlayer } from "@/lib/algorithms/single-elimination";
import { generateDoubleElimination } from "@/lib/algorithms/double-elimination";
import { generateRoundRobin } from "@/lib/algorithms/round-robin";
import { generateGroupKnockout } from "@/lib/algorithms/group-knockout";

// ── Main export ───────────────────────────────────────────

export async function generateFixtures(tournamentId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const tournament = await TournamentModel.findById(tournamentId).lean() as Record<string, unknown> | null;
  if (!tournament) return { success: false, error: "Tournament not found" };
  if (tournament.created_by !== user.id) return { success: false, error: "Only the tournament host can generate fixtures" };
  if (tournament.status !== "registration_closed" && tournament.status !== "draft") {
    return { success: false, error: "Close registration before generating fixtures" };
  }

  const participants = await ParticipantModel.find({ tournament_id: tournamentId, status: "registered" })
    .sort({ seed: 1 }).lean() as Array<{ player_id: string; seed?: number | null }>;
  if (participants.length < 2) return { success: false, error: "Need at least 2 participants" };

  const players: BracketPlayer[] = participants.map((p) => ({ id: p.player_id, seed: p.seed ?? undefined }));
  const format = tournament.format as TournamentFormat;
  const seeded = !!tournament.seed_based;

  try {
    // Clear existing fixtures
    const existingMatchIds = (await MatchModel.find({ tournament_id: tournamentId }).lean() as Array<{ _id: string }>).map(m => m._id);
    if (existingMatchIds.length) await MatchPlayerModel.deleteMany({ match_id: { $in: existingMatchIds } });
    await MatchModel.deleteMany({ tournament_id: tournamentId });
    await RoundModel.deleteMany({ tournament_id: tournamentId });

    switch (format) {
      case "single_elimination": await genSingleElim(tournamentId, players, seeded); break;
      case "double_elimination": await genDoubleElim(tournamentId, players, seeded); break;
      case "round_robin": await genRoundRobin(tournamentId, players); break;
      case "group_knockout":
        await genGroupKnockout(tournamentId, players,
          (tournament.group_count as number) ?? 4, (tournament.group_advance_count as number) ?? 2);
        break;
      default: return { success: false, error: `Unsupported format: ${format}` };
    }

    await ParticipantModel.updateMany(
      { tournament_id: tournamentId, status: "registered" },
      { $set: { status: "active" } }
    );

    revalidatePath(ROUTES.TOURNAMENT(tournamentId));
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Fixture generation failed" };
  }
}

// ── Single Elimination ─────────────────────────────────────

async function genSingleElim(tournamentId: string, players: BracketPlayer[], seeded: boolean) {
  const bracket = generateSingleElimination(players, seeded);

  // Map from roundNumber → DB round _id
  const roundMap = new Map<number, string>();
  for (const round of bracket.rounds) {
    const id = newId();
    await RoundModel.create({
      _id: id, tournament_id: tournamentId,
      round_number: round.roundNumber, name: round.name,
      bracket_side: round.bracketSide, is_grand_final: round.isGrandFinal,
      created_at: new Date().toISOString(),
    });
    roundMap.set(round.roundNumber, id);
  }

  // Map from (roundNumber, matchNumber) → DB match _id  (for next_match_id linking)
  const matchMap = new Map<string, string>();
  const now = new Date().toISOString();

  // First pass — create matches
  for (const match of bracket.matches) {
    const dbId = newId();
    matchMap.set(`${match.roundNumber}-${match.matchNumber}`, dbId);
    await MatchModel.create({
      _id: dbId, tournament_id: tournamentId,
      round_id: roundMap.get(match.roundNumber)!,
      match_number: match.matchNumber,
      status: match.isBye ? "bye" : "scheduled",
      created_at: now, updated_at: now,
    });
  }

  // Second pass — link next_match_id and seed players
  for (const match of bracket.matches) {
    const dbId = matchMap.get(`${match.roundNumber}-${match.matchNumber}`)!;
    if (match.nextMatchNumber != null && match.nextMatchRound != null) {
      const nextId = matchMap.get(`${match.nextMatchRound}-${match.nextMatchNumber}`);
      if (nextId) await MatchModel.findByIdAndUpdate(dbId, { next_match_id: nextId });
    }
    // Seed players
    if (match.player1?.id && !match.isBye) {
      await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player1.id, slot: 1, score: 0 });
    }
    if (match.player2?.id && !match.isBye) {
      await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player2.id, slot: 2, score: 0 });
    }
    // Auto-advance BYE
    if (match.isBye && match.player1?.id && match.nextMatchNumber != null && match.nextMatchRound != null) {
      const nextDbId = matchMap.get(`${match.nextMatchRound}-${match.nextMatchNumber}`);
      if (nextDbId) {
        await MatchModel.findByIdAndUpdate(dbId, { status: "completed", winner_id: match.player1.id });
        await MatchPlayerModel.create({ _id: newId(), match_id: nextDbId, player_id: match.player1.id, slot: 1, score: 0 });
      }
    }
  }
}

// ── Double Elimination ─────────────────────────────────────

async function genDoubleElim(tournamentId: string, players: BracketPlayer[], seeded: boolean) {
  const bracket = generateDoubleElimination(players, seeded);
  const now = new Date().toISOString();

  const roundMap = new Map<number, string>();
  for (const round of bracket.rounds) {
    const id = newId();
    await RoundModel.create({
      _id: id, tournament_id: tournamentId,
      round_number: round.roundNumber, name: round.name,
      bracket_side: round.bracketSide, is_grand_final: round.isGrandFinal,
      created_at: now,
    });
    roundMap.set(round.roundNumber, id);
  }

  const matchMap = new Map<string, string>();
  for (const match of bracket.matches) {
    const dbId = newId();
    matchMap.set(`${match.roundNumber}-${match.matchNumber}`, dbId);
    await MatchModel.create({
      _id: dbId, tournament_id: tournamentId,
      round_id: roundMap.get(match.roundNumber) || roundMap.values().next().value!,
      match_number: match.matchNumber,
      status: match.isBye ? "bye" : "scheduled",
      created_at: now, updated_at: now,
    });
  }

  for (const match of bracket.matches) {
    const dbId = matchMap.get(`${match.roundNumber}-${match.matchNumber}`)!;
    const updates: Record<string, unknown> = {};
    if (match.nextMatchNumber != null && match.nextMatchRound != null) {
      const nextId = matchMap.get(`${match.nextMatchRound}-${match.nextMatchNumber}`);
      if (nextId) updates.next_match_id = nextId;
    }
    if (Object.keys(updates).length) await MatchModel.findByIdAndUpdate(dbId, updates);
    if (match.player1?.id) await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player1.id, slot: 1, score: 0 });
    if (match.player2?.id) await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player2.id, slot: 2, score: 0 });
  }
}

// ── Round Robin ────────────────────────────────────────────

async function genRoundRobin(tournamentId: string, players: BracketPlayer[]) {
  const schedule = generateRoundRobin(players);
  const now = new Date().toISOString();

  // Derive rounds from unique roundNumbers in matches
  const uniqueRounds = [...new Set(schedule.matches.map(m => m.roundNumber))].sort((a, b) => a - b);
  const roundMap = new Map<number, string>();
  for (const rNum of uniqueRounds) {
    const id = newId();
    await RoundModel.create({
      _id: id, tournament_id: tournamentId,
      round_number: rNum, name: `Round ${rNum}`,
      bracket_side: "winners", is_grand_final: false,
      created_at: now,
    });
    roundMap.set(rNum, id);
  }

  for (const match of schedule.matches) {
    const dbId = newId();
    await MatchModel.create({
      _id: dbId, tournament_id: tournamentId,
      round_id: roundMap.get(match.roundNumber)!,
      match_number: match.matchNumber, status: "scheduled",
      created_at: now, updated_at: now,
    });
    if (match.player1?.id) await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player1.id, slot: 1, score: 0 });
    if (match.player2?.id) await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player2.id, slot: 2, score: 0 });
  }
}

// ── Group Knockout ─────────────────────────────────────────

async function genGroupKnockout(tournamentId: string, players: BracketPlayer[], groupCount: number, advanceCount: number) {
  const result = generateGroupKnockout(players, groupCount, advanceCount);
  const now = new Date().toISOString();

  let matchCounter = 1;
  const allRoundNumbers = new Set<number>();

  // Collect all round numbers from group matches
  for (const { schedule } of result.groupMatches) {
    for (const m of schedule.matches) allRoundNumbers.add(m.roundNumber);
  }

  const roundMap = new Map<number, string>();
  for (const rNum of [...allRoundNumbers].sort((a, b) => a - b)) {
    const id = newId();
    await RoundModel.create({
      _id: id, tournament_id: tournamentId,
      round_number: rNum, name: `Group Round ${rNum}`,
      bracket_side: "winners", is_grand_final: false,
      created_at: now,
    });
    roundMap.set(rNum, id);
  }

  for (const { group, schedule } of result.groupMatches) {
    for (const match of schedule.matches) {
      const dbId = newId();
      await MatchModel.create({
        _id: dbId, tournament_id: tournamentId,
        round_id: roundMap.get(match.roundNumber)!,
        match_number: matchCounter++, status: "scheduled",
        created_at: now, updated_at: now,
      });
      if (match.player1?.id) await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player1.id, slot: 1, score: 0 });
      if (match.player2?.id) await MatchPlayerModel.create({ _id: newId(), match_id: dbId, player_id: match.player2.id, slot: 2, score: 0 });
    }
  }
}
