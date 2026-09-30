-- ═══════════════════════════════════════════════════════════
-- Migration 003: Create Tournaments Table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE tournaments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by            UUID NOT NULL REFERENCES profiles(id),
  title                 VARCHAR(100) NOT NULL,
  description           TEXT,
  game_name             VARCHAR(50) NOT NULL,
  format                tournament_format NOT NULL,
  max_participants      INTEGER NOT NULL CHECK (max_participants > 1),
  current_participants  INTEGER NOT NULL DEFAULT 0,
  registration_opens_at TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ NOT NULL,
  starts_at             TIMESTAMPTZ NOT NULL,
  ends_at               TIMESTAMPTZ,
  rules                 TEXT,
  prize_description     VARCHAR(500),
  status                tournament_status NOT NULL DEFAULT 'draft',
  group_count           INTEGER,
  group_advance_count   INTEGER,
  seed_based            BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tournaments_status ON tournaments (status);
CREATE INDEX idx_tournaments_starts_at ON tournaments (starts_at);
CREATE INDEX idx_tournaments_game_name ON tournaments (game_name);
CREATE INDEX idx_tournaments_created_by ON tournaments (created_by);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
