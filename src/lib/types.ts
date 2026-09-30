// ═══════════════════════════════════════════════════════════
// Database Type Definitions
// Generated from the schema design — keep in sync with migrations
// ═══════════════════════════════════════════════════════════

// ─── Enums ───────────────────────────────────────────────

export type UserRole = "player" | "admin";

export type TournamentStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TournamentFormat =
  | "single_elimination"
  | "double_elimination"
  | "round_robin"
  | "group_knockout";

export type MatchStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "bye";

export type ParticipantStatus =
  | "registered"
  | "checked_in"
  | "eliminated"
  | "active"
  | "withdrawn";

export type NotificationType =
  | "match_reminder"
  | "tournament_start"
  | "registration_confirmed"
  | "opponent_assigned"
  | "match_result"
  | "tournament_completed";

export type BracketSide = "winners" | "losers";

// ─── Table Row Types ─────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  games_played: number;
  games_won: number;
  tournaments_played: number;
  tournaments_won: number;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  game_name: string;
  format: TournamentFormat;
  max_participants: number;
  current_participants: number;
  registration_opens_at: string;
  registration_closes_at: string;
  starts_at: string;
  ends_at: string | null;
  rules: string | null;
  prize_description: string | null;
  status: TournamentStatus;
  group_count: number | null;
  group_advance_count: number | null;
  seed_based: boolean;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  player_id: string;
  seed: number | null;
  status: ParticipantStatus;
  final_placement: number | null;
  registered_at: string;
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  name: string;
  bracket_side: BracketSide;
  is_grand_final: boolean;
  created_at: string;
}

export interface Group {
  id: string;
  tournament_id: string;
  name: string;
  group_number: number;
  created_at: string;
}

export interface GroupStanding {
  id: string;
  group_id: string;
  player_id: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  score_for: number;
  score_against: number;
}

export interface Match {
  id: string;
  tournament_id: string;
  round_id: string;
  group_id: string | null;
  match_number: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  status: MatchStatus;
  winner_id: string | null;
  next_match_id: string | null;
  loser_next_match_id: string | null;
  admin_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  score: number;
  slot: 1 | 2;
  is_winner: boolean | null;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  admin_id: string;
  event_type: string;
  old_score: number | null;
  new_score: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ─── Joined / View Types ─────────────────────────────────

export interface MatchWithPlayers extends Match {
  match_players: (MatchPlayer & { profile: Pick<Profile, "id" | "username" | "avatar_url"> })[];
  round: Pick<Round, "name" | "round_number" | "bracket_side">;
}

export interface TournamentWithCreator extends Tournament {
  creator: Pick<Profile, "id" | "username" | "avatar_url">;
}

export interface TournamentParticipantWithProfile extends TournamentParticipant {
  profile: Pick<Profile, "id" | "username" | "avatar_url" | "games_won" | "games_played">;
}

// ─── Server Action Response Type ─────────────────────────

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}
