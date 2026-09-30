// ═══════════════════════════════════════════════════════════
// Guest Identity — no passwords, no JWT
// Users pick a username; it's stored in a cookie.
// Anyone can use the app immediately.
// ═══════════════════════════════════════════════════════════

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";

const UID_COOKIE = "arena_uid";
const NAME_COOKIE = "arena_name";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export interface SessionUser {
  id: string;
  username: string;
  role: "player" | "admin"; // always "player" for now; host powers come from tournament.created_by
  games_played: number;
  games_won: number;
  tournaments_played: number;
  tournaments_won: number;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

// ── Read current guest from cookies ───────────────────────

export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const uid = store.get(UID_COOKIE)?.value;
    const username = store.get(NAME_COOKIE)?.value;
    if (!uid || !username) return null;

    // Ensure the user record exists in MongoDB
    await connectDB();
    const dbUser = await UserModel.findById(uid).lean();
    if (!dbUser) return null;

    const u = dbUser as {
      games_played?: number; games_won?: number;
      tournaments_played?: number; tournaments_won?: number;
      full_name?: string | null; bio?: string | null; avatar_url?: string | null;
      role?: string;
    };
    return {
      id: uid,
      username,
      role: (u.role ?? "player") as "player" | "admin",
      games_played: u.games_played ?? 0,
      games_won: u.games_won ?? 0,
      tournaments_played: u.tournaments_played ?? 0,
      tournaments_won: u.tournaments_won ?? 0,
      full_name: u.full_name ?? null,
      bio: u.bio ?? null,
      avatar_url: u.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}

// ── Set guest identity (called from /setup action) ─────────

export async function setGuestIdentity(username: string): Promise<{ id: string }> {
  await connectDB();

  // Re-use existing UID if user already has one
  const store = await cookies();
  let uid = store.get(UID_COOKIE)?.value;

  if (!uid) {
    uid = randomUUID();
  }

  // Upsert user in MongoDB
  await UserModel.findByIdAndUpdate(
    uid,
    { $set: { _id: uid, username } },
    { upsert: true, new: true }
  );

  // Write cookies
  store.set(UID_COOKIE, uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  store.set(NAME_COOKIE, username, {
    httpOnly: false, // readable by client for display
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return { id: uid };
}

// ── Clear identity (logout) ───────────────────────────────

export async function clearIdentity(): Promise<void> {
  const store = await cookies();
  store.delete(UID_COOKIE);
  store.delete(NAME_COOKIE);
}

export { UID_COOKIE, NAME_COOKIE };
