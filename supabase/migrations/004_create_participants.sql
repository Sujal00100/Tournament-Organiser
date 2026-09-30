-- ═══════════════════════════════════════════════════════════
-- Migration 004: Create Tournament Participants Table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE tournament_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seed          INTEGER,
  status        participant_status NOT NULL DEFAULT 'registered',
  final_placement INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (tournament_id, player_id)
);

-- Indexes
CREATE INDEX idx_tp_tournament_id ON tournament_participants (tournament_id);
CREATE INDEX idx_tp_player_id ON tournament_participants (player_id);

-- Enable RLS
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
