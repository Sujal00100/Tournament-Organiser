import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema } from "@/lib/validations/auth";

describe("signUpSchema", () => {
  it("accepts valid signup data", () => {
    const result = signUpSchema.safeParse({
      email: "player@example.com",
      password: "securepass123",
      username: "player_one",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "securepass123",
      username: "player_one",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signUpSchema.safeParse({
      email: "player@example.com",
      password: "short",
      username: "player_one",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username with spaces", () => {
    const result = signUpSchema.safeParse({
      email: "player@example.com",
      password: "securepass123",
      username: "player one",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username under 3 chars", () => {
    const result = signUpSchema.safeParse({
      email: "player@example.com",
      password: "securepass123",
      username: "ab",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts valid login data", () => {
    const result = signInSchema.safeParse({
      email: "player@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = signInSchema.safeParse({
      email: "player@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
