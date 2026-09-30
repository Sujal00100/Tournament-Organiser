import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { NotificationModel } from "@/lib/models";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ count: 0 });

  await connectDB();
  const count = await NotificationModel.countDocuments({ user_id: user.id, read: false });
  return NextResponse.json({ count });
}
