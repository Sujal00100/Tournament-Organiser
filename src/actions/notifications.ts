"use server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { NotificationModel } from "@/lib/db";
import type { ActionResponse, Notification } from "@/lib/types";

export async function getNotifications(): Promise<ActionResponse<Notification[]>> {
  const user = await getSession();
  if (!user) return { success: false, error: "Not authenticated" };

  await connectDB();
  const docs = await NotificationModel.find({ user_id: user.id }).sort({ created_at: -1 }).limit(50).lean();
  return {
    success: true,
    data: docs.map((d) => {
      const obj = { ...d } as Record<string, unknown>;
      obj.id = obj._id; delete obj._id; delete obj.__v;
      return obj as unknown as Notification;
    }),
  };
}

export async function markNotificationRead(notifId: string): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Not authenticated" };

  await connectDB();
  await NotificationModel.findOneAndUpdate({ _id: notifId, user_id: user.id }, { read: true });
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResponse> {
  const user = await getSession();
  if (!user) return { success: false, error: "Not authenticated" };

  await connectDB();
  await NotificationModel.updateMany({ user_id: user.id, read: false }, { $set: { read: true } });
  return { success: true };
}
