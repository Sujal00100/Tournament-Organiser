import { z } from "zod";

const baseTournamentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z.string().max(5000, "Description too long").optional(),
  game_name: z
    .string()
    .min(1, "Game name is required")
    .max(50, "Game name must be at most 50 characters"),
  format: z.enum([
    "single_elimination",
    "double_elimination",
    "round_robin",
    "group_knockout",
  ]),
  max_participants: z
    .number()
    .int()
    .min(2, "Must have at least 2 participants")
    .max(256, "Cannot exceed 256 participants"),
  registration_opens_at: z.string().datetime(),
  registration_closes_at: z.string().datetime(),
  starts_at: z.string().datetime(),
  rules: z.string().max(10000, "Rules too long").optional(),
  prize_description: z
    .string()
    .max(500, "Prize description too long")
    .optional(),
  group_count: z.number().int().min(2).max(32).optional(),
  group_advance_count: z.number().int().min(1).max(16).optional(),
  seed_based: z.boolean().default(false),
});

export const createTournamentSchema = baseTournamentSchema
  .refine(
    (data) => new Date(data.registration_closes_at) > new Date(data.registration_opens_at),
    {
      message: "Registration close must be after registration open",
      path: ["registration_closes_at"],
    }
  )
  .refine(
    (data) => new Date(data.starts_at) >= new Date(data.registration_closes_at),
    {
      message: "Tournament start must be after registration closes",
      path: ["starts_at"],
    }
  );

export const updateTournamentSchema = baseTournamentSchema.partial();

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
