"use server";

// ═══════════════════════════════════════════════════════════
// Tournament Server Actions — MongoDB/Mongoose
// ═══════════════════════════════════════════════════════════

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, ParticipantModel, newId } from "@/lib/db";
import { createTournamentSchema } from "@/lib/validations/tournament";
import type { ActionResponse, Tournament } from "@/lib/types";
import { ROUTES } from "@/lib/constants";

// ── helpers ───────────────────────────────────────────────

function toISO(val: string | null): string | null {
  if (!val) return null;
  if (val.includes("Z") || val.includes("+") || val.match(/T.*-\d{2}:\d{2}$/)) return val;
  return `${val}:00.000Z`;
}

function parseTournamentForm(formData: FormData) {
  return {
    title: (formData.get("title") as string)?.trim() || "",
    description: (formData.get("description") as string)?.trim() || undefined,
    game_name: formData.get("game_name") as string,
    format: formData.get("format") as string,
    max_participants: Number(formData.get("max_participants")) || 16,
    registration_opens_at: toISO(formData.get("registration_opens_at") as string) as string,
    registration_closes_at: toISO(formData.get("registration_closes_at") as string) as string,
    starts_at: toISO(formData.get("starts_at") as string) as string,
    rules: (formData.get("rules") as string)?.trim() || undefined,
    prize_description: (formData.get("prize_description") as string)?.trim() || undefined,
    seed_based: formData.get("seed_based") === "true",
    group_count: formData.get("group_count") ? Number(formData.get("group_count")) : undefined,
    group_advance_count: formData.get("group_advance_count")
      ? Number(formData.get("group_advance_count"))
      : undefined,
  };
}

function docToTournament(doc: Record<string, unknown>): Tournament {
  const obj = { ...doc } as Record<string, unknown>;
  if (obj._id !== undefined) { obj.id = obj._id; delete obj._id; }
  delete obj.__v;
  return obj as unknown as Tournament;
}

// ── createTournamentAsPlayer ──────────────────────────────
// Any guest user can host a tournament.

export async function createTournamentAsPlayer(
  _prevState: ActionResponse<Tournament>,
  formData: FormData
): Promise<ActionResponse<Tournament>> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  const rawData = parseTournamentForm(formData);
  const parsed = createTournamentSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };

  await connectDB();

  const id = newId();
  const now = new Date().toISOString();
  const doc = await TournamentModel.create({
    _id: id,
    created_by: user.id,
    ...parsed.data,
    status: "registration_open",
    current_participants: 0,
    created_at: now,
    updated_at: now,
  });

  revalidatePath(ROUTES.TOURNAMENTS);
  return { success: true, data: docToTournament(doc.toObject()) };
}

// Alias for admin route
export const createTournament = createTournamentAsPlayer;

// ── getTournaments ────────────────────────────────────────

export async function getTournaments(status?: string): Promise<Tournament[]> {
  await connectDB();
  const filter = status ? { status } : {};
  const docs = await TournamentModel.find(filter).sort({ created_at: -1 }).lean();
  return docs.map((d) => {
    const obj = { ...d } as Record<string, unknown>;
    if (obj._id !== undefined) { obj.id = obj._id; delete obj._id; }
    delete obj.__v;
    return obj as unknown as Tournament;
  });
}

// ── closeRegistration ─────────────────────────────────────

export async function closeRegistration(tournamentId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const tournament = await TournamentModel.findById(tournamentId).lean() as Record<string, unknown> | null;
  if (!tournament) return { success: false, error: "Tournament not found" };
  if (tournament.created_by !== user.id) return { success: false, error: "Only the host can close registration" };
  if (tournament.status !== "registration_open") return { success: false, error: "Registration is not open" };

  await TournamentModel.findByIdAndUpdate(tournamentId, {
    status: "registration_closed",
    updated_at: new Date().toISOString(),
  });

  revalidatePath(ROUTES.TOURNAMENT(tournamentId));
  revalidatePath(ROUTES.TOURNAMENTS);
  return { success: true };
}

// ── updateTournament ──────────────────────────────────────

export async function updateTournament(id: string, formData: FormData): Promise<ActionResponse<Tournament>> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const tournament = await TournamentModel.findById(id).lean() as Record<string, unknown> | null;
  if (!tournament) return { success: false, error: "Tournament not found" };
  if (tournament.created_by !== user.id) return { success: false, error: "Only the host can edit this tournament" };

  const fields = ["title", "description", "game_name", "rules", "prize_description",
    "registration_opens_at", "registration_closes_at", "starts_at", "max_participants"];

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of fields) {
    const val = formData.get(field);
    if (val !== null) update[field] = val || null;
  }

  const updated = await TournamentModel.findByIdAndUpdate(id, update, { new: true }).lean();
  revalidatePath(ROUTES.TOURNAMENT(id));
  revalidatePath(ROUTES.TOURNAMENTS);
  return { success: true, data: docToTournament(updated as Record<string, unknown>) };
}

// ── updateTournamentStatus ────────────────────────────────

export async function updateTournamentStatus(id: string, status: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const tournament = await TournamentModel.findById(id).lean() as Record<string, unknown> | null;
  if (!tournament) return { success: false, error: "Tournament not found" };
  if (tournament.created_by !== user.id) return { success: false, error: "Only the host can change status" };

  await TournamentModel.findByIdAndUpdate(id, { status, updated_at: new Date().toISOString() });
  revalidatePath(ROUTES.TOURNAMENT(id));
  revalidatePath(ROUTES.TOURNAMENTS);
  return { success: true };
}

// ── registerForTournament ─────────────────────────────────

export async function registerForTournament(tournamentId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first to join" };

  await connectDB();
  const tournament = await TournamentModel.findById(tournamentId).lean() as Record<string, unknown> | null;
  if (!tournament) return { success: false, error: "Tournament not found" };
  if (tournament.status !== "registration_open") return { success: false, error: "Registration is not open" };
  if ((tournament.current_participants as number) >= (tournament.max_participants as number)) {
    return { success: false, error: "Tournament is full" };
  }

  const existing = await ParticipantModel.findOne({ tournament_id: tournamentId, player_id: user.id }).lean();
  if (existing) return { success: false, error: "Already registered" };

  await ParticipantModel.create({
    _id: newId(),
    tournament_id: tournamentId,
    player_id: user.id,
    status: "registered",
    registered_at: new Date().toISOString(),
  });

  await TournamentModel.findByIdAndUpdate(tournamentId, {
    $inc: { current_participants: 1 },
    updated_at: new Date().toISOString(),
  });

  revalidatePath(ROUTES.TOURNAMENT(tournamentId));
  return { success: true };
}

// ── withdrawFromTournament ────────────────────────────────

export async function withdrawFromTournament(tournamentId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  await connectDB();
  const tournament = await TournamentModel.findById(tournamentId).lean() as Record<string, unknown> | null;
  if (!tournament || tournament.status !== "registration_open") {
    return { success: false, error: "Cannot withdraw at this stage" };
  }

  const result = await ParticipantModel.deleteOne({ tournament_id: tournamentId, player_id: user.id });
  if (result.deletedCount > 0) {
    await TournamentModel.findByIdAndUpdate(tournamentId, {
      $inc: { current_participants: -1 },
      updated_at: new Date().toISOString(),
    });
  }

  revalidatePath(ROUTES.TOURNAMENT(tournamentId));
  return { success: true };
}
