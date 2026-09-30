-- ═══════════════════════════════════════════════════════════
-- Migration 002: Create Profiles Table
-- Extends auth.users with application-specific data
-- ═══════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      VARCHAR(30) UNIQUE NOT NULL,
  full_name     VARCHAR(100),
  avatar_url    TEXT,
  bio           VARCHAR(500),
  role          user_role NOT NULL DEFAULT 'player',
  games_played  INTEGER NOT NULL DEFAULT 0,
  games_won     INTEGER NOT NULL DEFAULT 0,
  tournaments_played INTEGER NOT NULL DEFAULT 0,
  tournaments_won    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_role ON profiles (role);
CREATE INDEX idx_profiles_games_won ON profiles (games_won DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add to realtime publication (for profile updates)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
