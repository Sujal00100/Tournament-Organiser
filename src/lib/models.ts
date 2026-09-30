// ═══════════════════════════════════════════════════════════
// Mongoose Models — All schemas in one file
// IDs are string UUIDs (not ObjectId) to keep compat with
// the existing data shape.
// ═══════════════════════════════════════════════════════════

import mongoose, { Schema, model, models } from "mongoose";

// ── User ─────────────────────────────────────────────────

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    games_played: { type: Number, default: 0 },
    games_won: { type: Number, default: 0 },
    tournaments_played: { type: Number, default: 0 },
    tournaments_won: { type: Number, default: 0 },
  },
  { _id: false, timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const UserModel = models.User || model("User", UserSchema);

// ── Tournament ────────────────────────────────────────────

const TournamentSchema = new Schema(
  {
    _id: { type: String, required: true },
    created_by: { type: String, required: true, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, default: null },
    game_name: { type: String, required: true },
    format: { type: String, required: true },
    max_participants: { type: Number, required: true },
    current_participants: { type: Number, default: 0 },
    registration_opens_at: { type: String, required: true },
    registration_closes_at: { type: String, required: true },
    starts_at: { type: String, required: true },
    ends_at: { type: String, default: null },
    rules: { type: String, default: null },
    prize_description: { type: String, default: null },
    status: { type: String, default: "registration_open" },
    seed_based: { type: Boolean, default: false },
    group_count: { type: Number, default: null },
    group_advance_count: { type: Number, default: null },
  },
  { _id: false, timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const TournamentModel = models.Tournament || model("Tournament", TournamentSchema);

// ── Tournament Participant ─────────────────────────────────

const ParticipantSchema = new Schema(
  {
    _id: { type: String, required: true },
    tournament_id: { type: String, required: true, ref: "Tournament" },
    player_id: { type: String, required: true, ref: "User" },
    seed: { type: Number, default: null },
    status: { type: String, default: "registered" },
    final_placement: { type: Number, default: null },
    registered_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);
ParticipantSchema.index({ tournament_id: 1, player_id: 1 }, { unique: true });

export const ParticipantModel =
  models.Participant || model("Participant", ParticipantSchema);

// ── Round ────────────────────────────────────────────────

const RoundSchema = new Schema(
  {
    _id: { type: String, required: true },
    tournament_id: { type: String, required: true, ref: "Tournament" },
    round_number: { type: Number, required: true },
    name: { type: String, required: true },
    bracket_side: { type: String, default: "winners" },
    is_grand_final: { type: Boolean, default: false },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

export const RoundModel = models.Round || model("Round", RoundSchema);

// ── Match ────────────────────────────────────────────────

const MatchSchema = new Schema(
  {
    _id: { type: String, required: true },
    tournament_id: { type: String, required: true, ref: "Tournament" },
    round_id: { type: String, required: true, ref: "Round" },
    match_number: { type: Number, required: true },
    scheduled_at: { type: String, default: null },
    started_at: { type: String, default: null },
    completed_at: { type: String, default: null },
    status: { type: String, default: "scheduled" },
    winner_id: { type: String, default: null },
    next_match_id: { type: String, default: null },
    loser_next_match_id: { type: String, default: null },
    admin_verified: { type: Boolean, default: false },
    verified_by: { type: String, default: null },
    verified_at: { type: String, default: null },
  },
  { _id: false, timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const MatchModel = models.Match || model("Match", MatchSchema);

// ── MatchPlayer ───────────────────────────────────────────

const MatchPlayerSchema = new Schema(
  {
    _id: { type: String, required: true },
    match_id: { type: String, required: true, ref: "Match" },
    player_id: { type: String, required: true, ref: "User" },
    score: { type: Number, default: 0 },
    slot: { type: Number, enum: [1, 2], required: true },
    is_winner: { type: Boolean, default: null },
  },
  { _id: false }
);
MatchPlayerSchema.index({ match_id: 1, slot: 1 }, { unique: true });

export const MatchPlayerModel =
  models.MatchPlayer || model("MatchPlayer", MatchPlayerSchema);

// ── Notification ──────────────────────────────────────────

const NotificationSchema = new Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, ref: "User" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: null },
    read: { type: Boolean, default: false },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

export const NotificationModel =
  models.Notification || model("Notification", NotificationSchema);

// ── Helper: convert Mongoose doc to plain object ──────────

export function toPlain<T>(doc: mongoose.Document | null): T | null {
  if (!doc) return null;
  const obj = doc.toObject({ versionKey: false });
  // rename _id → id for consistency
  if (obj._id !== undefined) {
    obj.id = obj._id;
    delete obj._id;
  }
  return obj as T;
}

export function toPlainArray<T>(docs: mongoose.Document[]): T[] {
  return docs.map((d) => toPlain<T>(d) as T);
}
