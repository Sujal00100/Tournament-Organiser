import { describe, it, expect } from "vitest";
import {
  nextPowerOf2,
  getRoundName,
  generateSeededSlots,
} from "@/lib/algorithms/single-elimination";

describe("single-elimination helpers", () => {
  describe("nextPowerOf2", () => {
    it("returns same value for powers of 2", () => {
      expect(nextPowerOf2(2)).toBe(2);
      expect(nextPowerOf2(4)).toBe(4);
      expect(nextPowerOf2(8)).toBe(8);
      expect(nextPowerOf2(16)).toBe(16);
    });

    it("rounds up non-powers of 2", () => {
      expect(nextPowerOf2(3)).toBe(4);
      expect(nextPowerOf2(5)).toBe(8);
      expect(nextPowerOf2(7)).toBe(8);
      expect(nextPowerOf2(9)).toBe(16);
      expect(nextPowerOf2(15)).toBe(16);
    });

    it("handles 1", () => {
      expect(nextPowerOf2(1)).toBe(1);
    });
  });

  describe("getRoundName", () => {
    it("names rounds correctly for 8-player bracket (3 rounds)", () => {
      expect(getRoundName(1, 3)).toBe("Quarter-Finals");
      expect(getRoundName(2, 3)).toBe("Semi-Finals");
      expect(getRoundName(3, 3)).toBe("Finals");
    });

    it("names rounds correctly for 16-player bracket (4 rounds)", () => {
      expect(getRoundName(1, 4)).toBe("Round of 16");
      expect(getRoundName(2, 4)).toBe("Quarter-Finals");
      expect(getRoundName(3, 4)).toBe("Semi-Finals");
      expect(getRoundName(4, 4)).toBe("Finals");
    });
  });

  describe("generateSeededSlots", () => {
    it("generates correct slots for 4 players", () => {
      const slots = generateSeededSlots(4);
      expect(slots).toHaveLength(4);
      // Seed 1 (0) vs Seed 4 (3), Seed 2 (1) vs Seed 3 (2)
      expect(slots).toEqual([0, 3, 1, 2]);
    });

    it("generates correct slots for 8 players", () => {
      const slots = generateSeededSlots(8);
      expect(slots).toHaveLength(8);
      // Seed 1 vs 8, 4 vs 5, 3 vs 6, 2 vs 7
      expect(slots[0]).toBe(0); // seed 1
      expect(slots[1]).toBe(7); // seed 8
    });
  });
});
