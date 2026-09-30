-- ═══════════════════════════════════════════════════════════
-- Migration 006: Create Matches and Match Players Tables
-- ═══════════════════════════════════════════════════════════

CREATE TABLE matches (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id       UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_id            UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  group_id            UUID REFERENCES groups(id) ON DELETE SET NULL,
  match_number        INTEGER NOT NULL,
  scheduled_at        TIMESTAMPTZ,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  status              match_status NOT NULL DEFAULT 'scheduled',
  winner_id           UUID REFERENCES profiles(id),
  next_match_id       UUID REFERENCES matches(id),
  loser_next_match_id UUID REFERENCES matches(id),
  admin_verified      BOOLEAN NOT NULL DEFAULT false,
  verified_by         UUID REFERENCES profiles(id),
  verified_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_matches_tournament_status ON matches (tournament_id, status);
CREATE INDEX idx_matches_round ON matches (round_id);
CREATE INDEX idx_matches_scheduled ON matches (scheduled_at);
CREATE INDEX idx_matches_winner ON matches (winner_id);
CREATE INDEX idx_matches_next ON matches (next_match_id);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Match Players: the two competitors in each match with their scores
CREATE TABLE match_players (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score       INTEGER DEFAULT 0,
  slot        INTEGER NOT NULL CHECK (slot IN (1, 2)),
  is_winner   BOOLEAN,

  UNIQUE (match_id, player_id),
  UNIQUE (match_id, slot)
);

CREATE INDEX idx_mp_match ON match_players (match_id);
CREATE INDEX idx_mp_player ON match_players (player_id);

ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- Match Events: immutable log of score changes (realtime + audit)
CREATE TABLE match_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES profiles(id),
  admin_id    UUID NOT NULL REFERENCES profiles(id),
  event_type  VARCHAR(30) NOT NULL,
  old_score   INTEGER,
  new_score   INTEGER,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_me_match_created ON match_events (match_id, created_at);

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

-- Add match_events to realtime publication for live scoring
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
