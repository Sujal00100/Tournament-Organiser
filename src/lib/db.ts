// ═══════════════════════════════════════════════════════════
// DB helpers — Mongoose edition
// The main database is MongoDB via Mongoose (see lib/models.ts).
// This file just re-exports the ID generator used across actions.
// ═══════════════════════════════════════════════════════════

export { randomUUID as newId } from "crypto";

// Re-export all models for convenience
export {
  UserModel,
  TournamentModel,
  ParticipantModel,
  RoundModel,
  MatchModel,
  MatchPlayerModel,
  NotificationModel,
  toPlain,
  toPlainArray,
} from "@/lib/models";
