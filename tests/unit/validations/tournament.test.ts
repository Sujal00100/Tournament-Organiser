import { describe, it, expect } from "vitest";
import { createTournamentSchema } from "@/lib/validations/tournament";

describe("createTournamentSchema", () => {
  const validData = {
    title: "Summer Valorant Cup",
    game_name: "Valorant",
    format: "single_elimination" as const,
    max_participants: 16,
    registration_opens_at: "2026-09-01T10:00:00Z",
    registration_closes_at: "2026-09-05T10:00:00Z",
    starts_at: "2026-09-06T10:00:00Z",
    seed_based: false,
  };

  it("accepts valid tournament data", () => {
    const result = createTournamentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects max_participants below 2", () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      max_participants: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects max_participants above 256", () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      max_participants: 500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid format", () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      format: "battle_royale",
    });
    expect(result.success).toBe(false);
  });

  it("rejects registration close before open", () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      registration_opens_at: "2026-09-05T10:00:00Z",
      registration_closes_at: "2026-09-01T10:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects start before registration close", () => {
    const result = createTournamentSchema.safeParse({
      ...validData,
      registration_closes_at: "2026-09-10T10:00:00Z",
      starts_at: "2026-09-06T10:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});
