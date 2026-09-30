// ═══════════════════════════════════════════════════════════
// Group Stage + Knockout Generator
// Phase 5 — Full implementation
// ═══════════════════════════════════════════════════════════

import type { BracketPlayer } from "./single-elimination";
import { generateRoundRobin, type RoundRobinMatch } from "./round-robin";

export interface GroupDefinition {
  groupNumber: number;
  name: string;
  players: BracketPlayer[];
}

export interface GroupKnockoutResult {
  groups: GroupDefinition[];
  groupMatches: {
    group: GroupDefinition;
    schedule: { totalRounds: number; matches: RoundRobinMatch[] };
  }[];
}

/**
 * Distributes players evenly into groups using snake draft for fairness.
 */
export function distributeIntoGroups(
  players: BracketPlayer[],
  groupCount: number
): GroupDefinition[] {
  const groups: GroupDefinition[] = Array.from(
    { length: groupCount },
    (_, i) => ({
      groupNumber: i + 1,
      name: `Group ${String.fromCharCode(65 + i)}`,
      players: [],
    })
  );

  // Snake draft: 0,1,2,...,n-1,n-1,...,2,1,0,0,1,...
  players.forEach((player, index) => {
    const cycle = Math.floor(index / groupCount);
    const pos = index % groupCount;
    const groupIndex = cycle % 2 === 0 ? pos : groupCount - 1 - pos;
    groups[groupIndex].players.push(player);
  });

  return groups;
}

/**
 * Generates group stage with round robin schedules per group.
 * Knockout bracket is generated AFTER group stage completes
 * (triggered by a separate server action).
 */
export function generateGroupKnockout(
  players: BracketPlayer[],
  groupCount: number,
  _advanceCount: number
): GroupKnockoutResult {
  const groups = distributeIntoGroups(players, groupCount);

  // Generate round robin schedule within each group
  const groupMatches = groups.map((group) => ({
    group,
    schedule: generateRoundRobin(group.players),
  }));

  return { groups, groupMatches };
}
