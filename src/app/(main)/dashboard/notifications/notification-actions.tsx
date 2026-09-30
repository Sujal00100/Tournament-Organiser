"use client";

import { Button } from "@/components/ui/button";
import { Check, CheckCheck } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/notifications";
import { useTransition } from "react";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markNotificationRead(notificationId);
        });
      }}
      aria-label="Mark as read"
    >
      <Check className="h-3.5 w-3.5" />
    </Button>
  );
}

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markAllNotificationsRead();
        });
      }}
    >
      <CheckCheck className="h-4 w-4" />
      Mark all read
    </Button>
  );
}
