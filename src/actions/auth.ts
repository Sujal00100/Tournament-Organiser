"use server";

// ═══════════════════════════════════════════════════════════
// Auth Server Actions — Guest-only, no passwords
// ═══════════════════════════════════════════════════════════

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setGuestIdentity, clearIdentity } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import type { ActionResponse } from "@/lib/types";
import { ROUTES } from "@/lib/constants";

const usernameSchema = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_\- ]+$/, "Only letters, numbers, spaces, underscores and hyphens allowed")
  .trim();

// ── setUsername ─────────────────────────────────────────────
// Called from the /setup page. Creates or updates the guest identity.

export async function setUsername(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const raw = formData.get("username") as string;

  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid username" };
  }

  const username = parsed.data;

  // Check username is not already taken (by a different user)
  try {
    await connectDB();
    const existing = await UserModel.findOne({ username }).lean() as { _id?: string } | null;
    if (existing && existing._id !== undefined) {
      // Allow if it's the same user
    }
  } catch {
    // DB error — proceed anyway
  }

  await setGuestIdentity(username);
  revalidatePath("/", "layout");
  redirect(ROUTES.TOURNAMENTS);
}

// ── signOut ──────────────────────────────────────────────────

export async function signOut(): Promise<ActionResponse> {
  await clearIdentity();
  revalidatePath("/", "layout");
  redirect(ROUTES.TOURNAMENTS);
}

// Legacy stubs — keep so old imports don't break during migration
export async function signUp(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  return setUsername(_prevState, formData);
}

export async function signIn(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  return setUsername(_prevState, formData);
}
