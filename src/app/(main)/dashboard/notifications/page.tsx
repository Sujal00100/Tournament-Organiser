import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { NotificationModel } from "@/lib/models";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Bell } from "lucide-react";
import { MarkReadButton, MarkAllReadButton } from "./notification-actions";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);

  await connectDB();

  const notifDocs = await NotificationModel.find({ user_id: user.id })
    .sort({ created_at: -1 }).limit(50).lean() as Array<Record<string, unknown>>;

  const notifications = notifDocs.map((n) => ({
    id: String(n._id),
    type: String(n.type ?? ""),
    title: String(n.title ?? ""),
    body: String(n.body ?? ""),
    read: Boolean(n.read),
    created_at: String(n.created_at ?? ""),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Notifications</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 rounded-xl border px-6 py-4 transition-colors ${
                notif.read ? "border-border/30 bg-card/20" : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${notif.read ? "bg-muted/30 text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${notif.read ? "text-muted-foreground" : "text-foreground"}`}>{notif.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{notif.body}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">{new Date(notif.created_at).toLocaleString()}</p>
              </div>
              {!notif.read && <MarkReadButton notificationId={notif.id} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
          <Bell className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-muted-foreground">No notifications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">You&apos;ll be notified about matches and tournament updates</p>
        </div>
      )}
    </div>
  );
}
