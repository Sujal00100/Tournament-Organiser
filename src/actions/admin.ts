"use server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, UserModel } from "@/lib/db";
import type { ActionResponse } from "@/lib/types";

// All admin actions are now available to tournament hosts only
// No global admin — anyone can host their own tournament

export async function getAdminStats(): Promise<ActionResponse<{
  totalUsers: number;
  totalTournaments: number;
  activeTournaments: number;
}>> {
  const user = await getSession();
  if (!user) return { success: false, error: "Not authenticated" };

  await connectDB();
  const [totalUsers, totalTournaments, activeTournaments] = await Promise.all([
    UserModel.countDocuments(),
    TournamentModel.countDocuments(),
    TournamentModel.countDocuments({ status: { $in: ["registration_open", "in_progress"] } }),
  ]);

  return { success: true, data: { totalUsers, totalTournaments, activeTournaments } };
}

export async function deleteUser(_userId: string): Promise<ActionResponse> {
  return { success: false, error: "User management not available in this version" };
}

export async function deleteTournament(tournamentId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Not authenticated" };

  await connectDB();

  const tournament = await TournamentModel.findById(tournamentId).lean() as { created_by?: string } | null;
  if (!tournament) return { success: false, error: "Tournament not found" };

  const isHost = tournament.created_by === user.id;
  const isAdmin = user.role === "admin";
  if (!isHost && !isAdmin) return { success: false, error: "Not authorized" };

  await TournamentModel.findByIdAndUpdate(tournamentId, { $set: { status: "cancelled" } });
  return { success: true };
}

export async function promoteToAdmin(userId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user || user.role !== "admin") return { success: false, error: "Admin access required" };

  await connectDB();
  await UserModel.findByIdAndUpdate(userId, { $set: { role: "admin" } });
  return { success: true };
}

export async function demoteToPlayer(userId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user || user.role !== "admin") return { success: false, error: "Admin access required" };

  await connectDB();
  await UserModel.findByIdAndUpdate(userId, { $set: { role: "player" } });
  return { success: true };
}

