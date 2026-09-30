-- ═══════════════════════════════════════════════════════════
-- Migration 005: Create Rounds and Groups Tables
-- ═══════════════════════════════════════════════════════════

-- Rounds: logical stages within a tournament bracket
CREATE TABLE rounds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number    INTEGER NOT NULL,
  name            VARCHAR(50) NOT NULL,
  bracket_side    bracket_side DEFAULT 'winners',
  is_grand_final  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rounds_tournament ON rounds (tournament_id, bracket_side, round_number);

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Groups: only used for group_knockout format
CREATE TABLE groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name            VARCHAR(20) NOT NULL,
  group_number    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_groups_tournament ON groups (tournament_id, group_number);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Group Standings: tracks win/loss/points per player per group
CREATE TABLE group_standings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  played        INTEGER NOT NULL DEFAULT 0,
  won           INTEGER NOT NULL DEFAULT 0,
  lost          INTEGER NOT NULL DEFAULT 0,
  drawn         INTEGER NOT NULL DEFAULT 0,
  points        INTEGER NOT NULL DEFAULT 0,
  score_for     INTEGER NOT NULL DEFAULT 0,
  score_against INTEGER NOT NULL DEFAULT 0,

  UNIQUE (group_id, player_id)
);

CREATE INDEX idx_gs_group_points ON group_standings (group_id, points DESC, score_for DESC);

ALTER TABLE group_standings ENABLE ROW LEVEL SECURITY;
