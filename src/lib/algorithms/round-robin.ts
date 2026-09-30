// ═══════════════════════════════════════════════════════════
// Round Robin Schedule Generator — Circle Method
// Phase 5 — Full implementation
// ═══════════════════════════════════════════════════════════

import type { BracketPlayer } from "./single-elimination";

export interface RoundRobinMatch {
  roundNumber: number;
  matchNumber: number;
  player1: BracketPlayer;
  player2: BracketPlayer;
}

export interface RoundRobinSchedule {
  totalRounds: number;
  matches: RoundRobinMatch[];
}

const BYE_PLAYER: BracketPlayer = { id: "__BYE__" };

/**
 * Generates a round robin schedule using the Circle Method.
 *
 * Algorithm:
 * 1. If odd number of players, add a BYE player
 * 2. Fix player[0] in position
 * 3. Rotate remaining players each round
 * 4. Pair fixed player with top of rotation
 * 5. Pair remaining by mirroring
 */
export function generateRoundRobin(
  players: BracketPlayer[]
): RoundRobinSchedule {
  if (players.length < 2) {
    return { totalRounds: 0, matches: [] };
  }

  const allPlayers = [...players];
  const isOdd = allPlayers.length % 2 !== 0;

  if (isOdd) {
    allPlayers.push(BYE_PLAYER);
  }

  const n = allPlayers.length;
  const totalRounds = n - 1;
  const matches: RoundRobinMatch[] = [];

  // Fix first player, rotate the rest
  const fixed = allPlayers[0];
  const rotating = allPlayers.slice(1);

  let globalMatchNum = 0;

  for (let round = 1; round <= totalRounds; round++) {
    // Pair fixed with current "top" of rotation
    const opponent = rotating[0];
    if (fixed.id !== BYE_PLAYER.id && opponent.id !== BYE_PLAYER.id) {
      globalMatchNum++;
      matches.push({
        roundNumber: round,
        matchNumber: globalMatchNum,
        player1: fixed,
        player2: opponent,
      });
    }

    // Pair remaining by mirroring
    for (let i = 1; i < n / 2; i++) {
      const p1 = rotating[i];
      const p2 = rotating[n - 2 - i]; // Mirror from end

      if (p1.id !== BYE_PLAYER.id && p2.id !== BYE_PLAYER.id) {
        globalMatchNum++;
        matches.push({
          roundNumber: round,
          matchNumber: globalMatchNum,
          player1: p1,
          player2: p2,
        });
      }
    }

    // Rotate: move last element to front
    const last = rotating.pop()!;
    rotating.unshift(last);
  }

  return { totalRounds, matches };
}
