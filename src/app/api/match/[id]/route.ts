import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MatchModel, MatchPlayerModel } from "@/lib/models";
import { UserModel } from "@/lib/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/match/[id]
 * Returns live match data for polling-based real-time updates.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;

  await connectDB();

  const matchDoc = await MatchModel.findById(id).lean() as Record<string, unknown> | null;
  if (!matchDoc) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Fetch winner username if present
  let winner_username: string | null = null;
  if (matchDoc.winner_id) {
    const w = await UserModel.findById(matchDoc.winner_id).select("username").lean() as { username?: string } | null;
    winner_username = w?.username ?? null;
  }

  const match = { ...matchDoc, id: String(matchDoc._id), _id: undefined, winner_username };

  const playerDocs = await MatchPlayerModel.find({ match_id: id }).sort({ slot: 1 }).lean() as Array<Record<string, unknown>>;
  const playerUserIds = playerDocs.map((p) => p.player_id as string).filter(Boolean);
  const userDocs = await UserModel.find({ _id: { $in: playerUserIds } }).select("_id username").lean() as Array<{ _id: string; username?: string }>;
  const userMap = new Map(userDocs.map((u) => [String(u._id), u.username ?? null]));

  const players = playerDocs.map((p) => ({
    ...p,
    id: String(p._id),
    _id: undefined,
    username: userMap.get(p.player_id as string) ?? null,
    avatar_url: null,
  }));

  return NextResponse.json({ match, players });
}
