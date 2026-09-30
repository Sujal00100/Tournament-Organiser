-- ═══════════════════════════════════════════════════════════
-- Migration 007: Create Notifications and Push Subscriptions
-- ═══════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user_unread ON notifications (user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add notifications to realtime for live notification badge
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Push Subscriptions: Web Push API subscription storage
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_user ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
