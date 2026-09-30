// ═══════════════════════════════════════════════════════════
// Single Elimination Bracket Generator
// Phase 5 — Full implementation
// ═══════════════════════════════════════════════════════════

export interface BracketPlayer {
  id: string;
  seed?: number;
}

export interface GeneratedMatch {
  roundNumber: number;
  matchNumber: number;
  player1: BracketPlayer | null;
  player2: BracketPlayer | null;
  isBye: boolean;
  winnerId: string | null;
  nextMatchNumber: number | null;
  nextMatchRound: number | null;
  bracketSide: "winners" | "losers";
}

export interface GeneratedRound {
  roundNumber: number;
  name: string;
  bracketSide: "winners" | "losers";
  isGrandFinal: boolean;
}

export interface GeneratedBracket {
  rounds: GeneratedRound[];
  matches: GeneratedMatch[];
}

/**
 * Returns the next power of 2 >= n.
 */
export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Returns a human-readable round name based on position.
 */
export function getRoundName(
  roundNumber: number,
  totalRounds: number
): string {
  const roundsFromEnd = totalRounds - roundNumber;
  switch (roundsFromEnd) {
    case 0:
      return "Finals";
    case 1:
      return "Semi-Finals";
    case 2:
      return "Quarter-Finals";
    default:
      return `Round of ${Math.pow(2, roundsFromEnd + 1)}`;
  }
}

/**
 * Generates standard seeded bracket positions so that
 * seed 1 and seed 2 can only meet in the final.
 */
export function generateSeededSlots(bracketSize: number): number[] {
  if (bracketSize === 1) return [0];

  const half = generateSeededSlots(bracketSize / 2);
  const result: number[] = [];
  for (const pos of half) {
    result.push(pos);
    result.push(bracketSize - 1 - pos);
  }
  return result;
}

/**
 * Shuffles an array in place using Fisher-Yates.
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a single elimination bracket for the given players.
 * Handles BYEs for non-power-of-2 counts.
 * Supports seeded and unseeded brackets.
 */
export function generateSingleElimination(
  players: BracketPlayer[],
  seeded: boolean = false,
  bracketSide: "winners" | "losers" = "winners"
): GeneratedBracket {
  const n = players.length;
  if (n < 2) {
    return { rounds: [], matches: [] };
  }

  const bracketSize = nextPowerOf2(n);
  const totalRounds = Math.log2(bracketSize);
  const byeCount = bracketSize - n;

  // Sort by seed if seeded, else shuffle
  const orderedPlayers = seeded
    ? [...players].sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity))
    : shuffleArray(players);

  // Generate rounds
  const rounds: GeneratedRound[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push({
      roundNumber: r,
      name: getRoundName(r, totalRounds),
      bracketSide,
      isGrandFinal: false,
    });
  }

  // Generate matches for all rounds
  const matches: GeneratedMatch[] = [];
  const matchCountByRound: number[] = [];

  // Calculate matches per round (round 1 has bracketSize/2 matches, halves each round)
  let matchesInRound = bracketSize / 2;
  for (let r = 1; r <= totalRounds; r++) {
    matchCountByRound[r] = matchesInRound;
    matchesInRound = Math.floor(matchesInRound / 2);
  }

  // Create all matches (empty for future rounds)
  let globalMatchNum = 0;
  const matchGrid: GeneratedMatch[][] = Array.from(
    { length: totalRounds + 1 },
    () => []
  );

  // Build from round 1 to final
  for (let r = 1; r <= totalRounds; r++) {
    for (let m = 1; m <= matchCountByRound[r]; m++) {
      globalMatchNum++;
      const match: GeneratedMatch = {
        roundNumber: r,
        matchNumber: globalMatchNum,
        player1: null,
        player2: null,
        isBye: false,
        winnerId: null,
        nextMatchNumber: null,
        nextMatchRound: null,
        bracketSide,
      };
      matchGrid[r].push(match);
      matches.push(match);
    }
  }

  // Link matches: winner of match M in round R goes to match ceil(M/2) in round R+1
  for (let r = 1; r < totalRounds; r++) {
    for (let m = 0; m < matchGrid[r].length; m++) {
      const nextMatchIdx = Math.floor(m / 2);
      const nextMatch = matchGrid[r + 1][nextMatchIdx];
      if (nextMatch) {
        matchGrid[r][m].nextMatchNumber = nextMatch.matchNumber;
        matchGrid[r][m].nextMatchRound = r + 1;
      }
    }
  }

  // Assign players to Round 1
  const slots = seeded
    ? generateSeededSlots(bracketSize)
    : Array.from({ length: bracketSize }, (_, i) => i);

  for (let i = 0; i < bracketSize; i += 2) {
    const matchIdx = i / 2;
    const match = matchGrid[1][matchIdx];

    const slot1 = slots[i];
    const slot2 = slots[i + 1];
    const p1 = slot1 < n ? orderedPlayers[slot1] : null;
    const p2 = slot2 < n ? orderedPlayers[slot2] : null;

    match.player1 = p1;
    match.player2 = p2;

    if (!p1 && p2) {
      // BYE — player 2 auto-advances
      match.isBye = true;
      match.winnerId = p2.id;
      advanceWinner(match, p2, matchGrid);
    } else if (p1 && !p2) {
      // BYE — player 1 auto-advances
      match.isBye = true;
      match.winnerId = p1.id;
      advanceWinner(match, p1, matchGrid);
    }
  }

  return { rounds, matches };
}

/**
 * Places the winner into the next match's appropriate slot.
 */
function advanceWinner(
  currentMatch: GeneratedMatch,
  winner: BracketPlayer,
  matchGrid: GeneratedMatch[][]
): void {
  if (!currentMatch.nextMatchRound || !currentMatch.nextMatchNumber) return;

  const nextRoundMatches = matchGrid[currentMatch.nextMatchRound];
  const nextMatch = nextRoundMatches?.find(
    (m) => m.matchNumber === currentMatch.nextMatchNumber
  );

  if (!nextMatch) return;

  // Find this match's index within its round
  const currentRound = matchGrid[currentMatch.roundNumber];
  const matchIdx = currentRound.indexOf(currentMatch);

  // Even index → slot 1 (top), odd index → slot 2 (bottom)
  if (matchIdx % 2 === 0) {
    nextMatch.player1 = winner;
  } else {
    nextMatch.player2 = winner;
  }

  // If both players are now assigned to next match and one is null (another BYE case)
  // this auto-resolves in the fixture generation server action
}
