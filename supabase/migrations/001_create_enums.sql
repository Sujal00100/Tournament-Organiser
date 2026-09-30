-- ═══════════════════════════════════════════════════════════
-- Migration 001: Create Custom Enums
-- ═══════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('player', 'admin');

CREATE TYPE tournament_status AS ENUM (
  'draft',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE tournament_format AS ENUM (
  'single_elimination',
  'double_elimination',
  'round_robin',
  'group_knockout'
);

CREATE TYPE match_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'bye'
);

CREATE TYPE participant_status AS ENUM (
  'registered',
  'checked_in',
  'eliminated',
  'active',
  'withdrawn'
);

CREATE TYPE notification_type AS ENUM (
  'match_reminder',
  'tournament_start',
  'registration_confirmed',
  'opponent_assigned',
  'match_result',
  'tournament_completed'
);

CREATE TYPE bracket_side AS ENUM ('winners', 'losers');
