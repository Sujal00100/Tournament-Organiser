import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .optional(),
  full_name: z.string().max(100, "Name too long").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
