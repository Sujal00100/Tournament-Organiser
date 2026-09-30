"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel, newId } from "@/lib/db";
import type { ActionResponse, Profile } from "@/lib/types";

export async function updateProfile(formData: FormData): Promise<ActionResponse<Profile>> {
  const user = await getSession();
  if (!user) return { success: false, error: "Please set a username first" };

  const username = (formData.get("username") as string)?.trim();
  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;

  if (username && (username.length < 2 || username.length > 30)) {
    return { success: false, error: "Username must be 2–30 characters" };
  }

  await connectDB();

  const update: Record<string, unknown> = {};
  if (username) update.username = username;
  if (full_name !== undefined) update.full_name = full_name;
  if (bio !== undefined) update.bio = bio;

  await UserModel.findByIdAndUpdate(user.id, update);
  const updated = await UserModel.findById(user.id).lean() as Record<string, unknown> | null;
  if (!updated) return { success: false, error: "User not found" };

  revalidatePath("/dashboard/profile");
  return {
    success: true, data: {
      id: updated._id as string,
      username: updated.username as string,
      full_name: (updated.full_name as string | null) ?? null,
      avatar_url: null,
      bio: (updated.bio as string | null) ?? null,
      role: "player",
      games_played: (updated.games_played as number) ?? 0,
      games_won: (updated.games_won as number) ?? 0,
      tournaments_played: (updated.tournaments_played as number) ?? 0,
      tournaments_won: (updated.tournaments_won as number) ?? 0,
      created_at: (updated.created_at as string) ?? new Date().toISOString(),
      updated_at: (updated.updated_at as string) ?? new Date().toISOString(),
    }
  };
}

export async function uploadAvatar(_formData: FormData): Promise<ActionResponse<{ url: string }>> {
  return { success: false, error: "Avatar upload coming soon" };
}
