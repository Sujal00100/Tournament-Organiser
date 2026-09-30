import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { NotificationModel } from "@/lib/models";

/**
 * GET /api/notifications
 * Returns unread notification count for the current user.
 * Used for 10s polling to replace Supabase Realtime.
 */
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ count: 0, notifications: [] });

  await connectDB();

  const count = await NotificationModel.countDocuments({ user_id: user.id, read: false });

  const notifications = await NotificationModel.find({ user_id: user.id })
    .sort({ created_at: -1 })
    .limit(20)
    .lean();

  const plain = notifications.map((n: Record<string, unknown>) => ({
    ...(n as object),
    id: String(n._id),
    _id: undefined,
  }));

  return NextResponse.json({ count, notifications: plain });
}
