// ═══════════════════════════════════════════════════════════
// Double Elimination Bracket Generator
// Phase 5 — Full implementation
// ═══════════════════════════════════════════════════════════

import {
  type BracketPlayer,
  type GeneratedBracket,
  type GeneratedMatch,
  type GeneratedRound,
  generateSingleElimination,
  getRoundName,
} from "./single-elimination";

/**
 * Generates a double elimination bracket.
 * - Winners bracket: standard single elimination
 * - Losers bracket: losers from winners drop in; internal losers matches
 * - Grand final: winner of winners vs winner of losers
 */
export function generateDoubleElimination(
  players: BracketPlayer[],
  seeded: boolean = false
): GeneratedBracket {
  if (players.length < 2) {
    return { rounds: [], matches: [] };
  }

  // Generate the winners bracket
  const winners = generateSingleElimination(players, seeded, "winners");

  // Build losers bracket structure
  const winnersRoundCount = winners.rounds.length;
  // Losers bracket has 2*(winnersRoundCount - 1) rounds
  const losersRoundCount = Math.max(0, 2 * (winnersRoundCount - 1));

  const losersRounds: GeneratedRound[] = [];
  for (let lr = 1; lr <= losersRoundCount; lr++) {
    losersRounds.push({
      roundNumber: winnersRoundCount + lr, // offset so round numbers don't clash
      name: `Losers Round ${lr}`,
      bracketSide: "losers",
      isGrandFinal: false,
    });
  }

  // Create losers bracket matches (empty — filled as tournament progresses)
  const losersMatches: GeneratedMatch[] = [];
  let matchNum = winners.matches.length;

  // Losers bracket match count halves every 2 rounds
  let losersMatchCount = Math.floor(players.length / 4);

  for (let lr = 1; lr <= losersRoundCount; lr++) {
    const matchesThisRound = Math.max(1, losersMatchCount);
    for (let m = 1; m <= matchesThisRound; m++) {
      matchNum++;
      losersMatches.push({
        roundNumber: winnersRoundCount + lr,
        matchNumber: matchNum,
        player1: null,
        player2: null,
        isBye: false,
        winnerId: null,
        nextMatchNumber: null,
        nextMatchRound: null,
        bracketSide: "losers",
      });
    }

    // Every 2 losers rounds, halve the match count
    if (lr % 2 === 0) {
      losersMatchCount = Math.max(1, Math.floor(losersMatchCount / 2));
    }
  }

  // Grand Final round
  const grandFinalRound: GeneratedRound = {
    roundNumber: winnersRoundCount + losersRoundCount + 1,
    name: "Grand Final",
    bracketSide: "winners",
    isGrandFinal: true,
  };

  matchNum++;
  const grandFinalMatch: GeneratedMatch = {
    roundNumber: grandFinalRound.roundNumber,
    matchNumber: matchNum,
    player1: null,
    player2: null,
    isBye: false,
    winnerId: null,
    nextMatchNumber: null,
    nextMatchRound: null,
    bracketSide: "winners",
  };

  return {
    rounds: [...winners.rounds, ...losersRounds, grandFinalRound],
    matches: [...winners.matches, ...losersMatches, grandFinalMatch],
  };
}
