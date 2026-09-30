import { z } from "zod";

export const updateScoreSchema = z.object({
  match_id: z.string().uuid(),
  player_id: z.string().uuid(),
  score: z.number().int().min(0, "Score cannot be negative"),
});

export const completeMatchSchema = z.object({
  match_id: z.string().uuid(),
  winner_id: z.string().uuid(),
});

export const scheduleMatchSchema = z.object({
  match_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
});

export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
export type CompleteMatchInput = z.infer<typeof completeMatchSchema>;
export type ScheduleMatchInput = z.infer<typeof scheduleMatchSchema>;
