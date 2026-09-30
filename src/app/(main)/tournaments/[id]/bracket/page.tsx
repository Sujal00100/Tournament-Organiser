import { connectDB } from "@/lib/mongodb";
import { TournamentModel, RoundModel, MatchModel, MatchPlayerModel, UserModel } from "@/lib/models";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TOURNAMENT_FORMAT_LABELS, ROUTES } from "@/lib/constants";
import { Trophy, Swords, ArrowLeft, ChevronRight, Users, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import type { TournamentFormat, MatchStatus } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const doc = await TournamentModel.findById(id).select("title").lean() as { title?: string } | null;
  return {
    title: doc?.title ? `${doc.title} — Bracket` : "Tournament Bracket",
  };
}

interface BracketMatch {
  id: string;
  match_number: number;
  status: string;
  winner_id: string | null;
  admin_verified: boolean;
  scheduled_at: string | null;
  players: Array<{
    player_id: string;
    username: string | null;
    score: number;
    slot: number;
    is_winner: boolean | null;
  }>;
}

interface BracketRound {
  id: string;
  name: string;
  round_number: number;
  bracket_side: string;
  is_grand_final: boolean;
  matches: BracketMatch[];
}

export default async function TournamentBracketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();

  const doc = await TournamentModel.findById(id).lean() as Record<string, unknown> | null;
  if (!doc) notFound();

  const tournament = {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    format: String(doc.format ?? ""),
    status: String(doc.status ?? ""),
    game_name: String(doc.game_name ?? ""),
  };

  const user = await getSession();

  // Fetch rounds and matches
  const roundDocs = await RoundModel.find({ tournament_id: id })
    .sort({ bracket_side: 1, round_number: 1 }).lean() as Array<{
      _id: string; name: string; round_number: number; bracket_side: string; is_grand_final: boolean;
    }>;

  const matchDocs = await MatchModel.find({ tournament_id: id })
    .sort({ match_number: 1 }).lean() as Array<{
      _id: string; match_number: number; status: string; winner_id: string | null;
      admin_verified: boolean; scheduled_at: string | null; round_id: string;
    }>;

  const matchIds = matchDocs.map((m) => String(m._id));
  const playerDocs = await MatchPlayerModel.find({ match_id: { $in: matchIds } }).lean() as Array<{
    _id: string; match_id: string; player_id: string; score: number; slot: number; is_winner: boolean | null;
  }>;

  const playerIds = [...new Set(playerDocs.map((p) => p.player_id))];
  const userDocs = await UserModel.find({ _id: { $in: playerIds } }).select("_id username").lean() as Array<{ _id: string; username?: string }>;
  const userMap = new Map(userDocs.map((u) => [String(u._id), u.username ?? null]));

  // Group players by match
  const playersByMatch = new Map<string, typeof playerDocs>();
  for (const p of playerDocs) {
    if (!playersByMatch.has(p.match_id)) playersByMatch.set(p.match_id, []);
    playersByMatch.get(p.match_id)!.push(p);
  }

  // Group matches by round
  const matchesByRound = new Map<string, typeof matchDocs>();
  for (const m of matchDocs) {
    const rid = String(m.round_id);
    if (!matchesByRound.has(rid)) matchesByRound.set(rid, []);
    matchesByRound.get(rid)!.push(m);
  }

  // Build structured rounds
  const rounds: BracketRound[] = roundDocs.map((r) => ({
    id: String(r._id),
    name: r.name,
    round_number: r.round_number,
    bracket_side: r.bracket_side,
    is_grand_final: r.is_grand_final,
    matches: (matchesByRound.get(String(r._id)) ?? []).map((m) => {
      const players = (playersByMatch.get(String(m._id)) ?? []).map((p) => ({
        player_id: p.player_id,
        username: userMap.get(p.player_id) ?? null,
        score: p.score,
        slot: p.slot,
        is_winner: p.is_winner,
      })).sort((a, b) => a.slot - b.slot);
      return {
        id: String(m._id),
        match_number: m.match_number,
        status: m.status,
        winner_id: m.winner_id,
        admin_verified: m.admin_verified,
        scheduled_at: m.scheduled_at ?? null,
        players,
      };
    }),
  }));

  // Separate bracket sides for double elimination
  const winnersRounds = rounds.filter((r) => r.bracket_side === "winners" && !r.is_grand_final);
  const losersRounds = rounds.filter((r) => r.bracket_side === "losers");
  const grandFinal = rounds.find((r) => r.is_grand_final);

  const hasFixtures = rounds.length > 0;
  const totalMatches = matchDocs.length;
  const completedMatches = matchDocs.filter((m) => m.status === "completed").length;

  const isDoubleElim = tournament.format === "double_elimination";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href={ROUTES.TOURNAMENT(id)} className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card/30 text-muted-foreground transition-all hover:bg-card/50 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="section-label mb-1">Bracket</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tournament.title}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{TOURNAMENT_FORMAT_LABELS[tournament.format as TournamentFormat] ?? tournament.format}</span>
              {hasFixtures && (
                <>
                  <span className="text-border/60">·</span>
                  <span className="font-mono">{completedMatches}/{totalMatches} matches completed</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {!hasFixtures ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Swords className="h-8 w-8 text-primary/40" />
          </div>
          <h2 className="text-xl font-semibold text-muted-foreground">Bracket Not Generated Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground/70">
            {tournament.status === "registration_open"
              ? "Registration is still open. The bracket will be generated after registration closes."
              : tournament.status === "registration_closed"
              ? "Registration is closed. The host can now generate fixtures."
              : "The bracket hasn't been set up yet."}
          </p>
          {user && <Link href={ROUTES.TOURNAMENT(id)} className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15">
            Back to Tournament <ChevronRight className="h-4 w-4" />
          </Link>}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Progress bar */}
          <div className="animate-fade-in-up rounded-2xl border border-border/40 bg-card/25 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium">Tournament Progress</span>
              <span className="font-mono text-muted-foreground">{completedMatches} / {totalMatches}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent-foreground/80 transition-all duration-700"
                style={{ width: `${totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Winners bracket */}
          {winnersRounds.length > 0 && (
            <BracketSection
              title={isDoubleElim ? "Winners Bracket" : "Bracket"}
              rounds={winnersRounds}
            />
          )}

          {/* Losers bracket (double elim) */}
          {losersRounds.length > 0 && (
            <BracketSection title="Losers Bracket" rounds={losersRounds} isLosers />
          )}

          {/* Grand final */}
          {grandFinal && (
            <div className="animate-fade-in-up">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.18_85/0.15)]">
                  <Trophy className="h-4 w-4 text-[oklch(0.78_0.18_85)]" />
                </div>
                <h2 className="text-lg font-bold text-[oklch(0.78_0.18_85)]">Grand Final</h2>
              </div>
              <div className="max-w-sm">
                {grandFinal.matches.map((match) => (
                  <MatchCard key={match.id} match={match} isGrandFinal />
                ))}
              </div>
            </div>
          )}

          {/* For single/group: show all rounds */}
          {!isDoubleElim && winnersRounds.length === 0 && rounds.length > 0 && (
            <BracketSection title="Bracket" rounds={rounds.filter((r) => !r.is_grand_final)} />
          )}
        </div>
      )}
    </div>
  );
}

function BracketSection({ title, rounds, isLosers }: { title: string; rounds: BracketRound[]; isLosers?: boolean }) {
  if (rounds.length === 0) return null;
  return (
    <div className="animate-fade-in-up">
      <div className="mb-4 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isLosers ? "bg-warning/15" : "bg-primary/15"}`}>
          <Swords className={`h-4 w-4 ${isLosers ? "text-warning" : "text-primary"}`} />
        </div>
        <h2 className={`text-lg font-bold ${isLosers ? "text-warning" : ""}`}>{title}</h2>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {rounds.map((round) => (
            <div key={round.id} className="flex w-64 flex-col gap-3">
              <div className="rounded-lg border border-border/30 bg-muted/20 px-3 py-1.5 text-center text-xs font-semibold text-muted-foreground">
                {round.name}
              </div>
              <div className="flex flex-col justify-around gap-3 flex-1">
                {round.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
                {round.matches.length === 0 && (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-border/30 py-6 text-xs text-muted-foreground/50">
                    TBD
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, isGrandFinal }: { match: BracketMatch; isGrandFinal?: boolean }) {
  const status = match.status as MatchStatus;
  const isBye = status === "bye";
  const isCompleted = status === "completed";
  const isLive = status === "in_progress";

  const player1 = match.players.find((p) => p.slot === 1);
  const player2 = match.players.find((p) => p.slot === 2);

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all ${
      isGrandFinal ? "border-[oklch(0.78_0.18_85/0.3)] bg-[oklch(0.78_0.18_85/0.05)]" :
      isLive ? "border-primary/30 bg-primary/5 shadow-[0_0_20px_oklch(0.63_0.26_285/0.1)]" :
      isCompleted ? "border-success/20 bg-success/5" :
      isBye ? "border-border/20 bg-muted/10 opacity-60" :
      "border-border/40 bg-card/30"
    }`}>
      {isLive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary animate-status-pulse" />
      )}
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-medium text-muted-foreground">#{match.match_number}</span>
          <MatchStatusPill status={status} verified={match.admin_verified} />
        </div>
        {isBye ? (
          <div className="py-2 text-center text-xs text-muted-foreground/60">BYE</div>
        ) : (
          <div className="space-y-1.5">
            <PlayerSlot player={player1} isWinner={player1?.is_winner === true} />
            <div className="flex items-center gap-2 px-1">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[9px] font-bold text-muted-foreground/60">VS</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            <PlayerSlot player={player2} isWinner={player2?.is_winner === true} />
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerSlot({ player, isWinner }: {
  player: { username: string | null; score: number } | undefined;
  isWinner: boolean;
}) {
  if (!player) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted/10 px-2.5 py-1.5">
        <Users className="h-3 w-3 text-muted-foreground/30" />
        <span className="flex-1 text-xs text-muted-foreground/40">TBD</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${
      isWinner ? "bg-success/10" : "bg-muted/15"
    }`}>
      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
        isWinner ? "bg-success/20 text-success" : "bg-muted/30 text-muted-foreground"
      }`}>
        {(player.username ?? "?").charAt(0).toUpperCase()}
      </div>
      <span className={`flex-1 truncate text-xs font-medium ${isWinner ? "text-success" : "text-foreground"}`}>
        {player.username ?? "Unknown"}
      </span>
      <span className={`font-mono text-xs font-bold ${isWinner ? "text-success" : "text-muted-foreground"}`}>
        {player.score}
      </span>
      {isWinner && <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />}
    </div>
  );
}

function MatchStatusPill({ status, verified }: { status: MatchStatus; verified: boolean }) {
  if (status === "completed") {
    return (
      <span className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
        verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
      }`}>
        {verified ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
        {verified ? "Verified" : "Done"}
      </span>
    );
  }
  if (status === "in_progress") {
    return <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-status-pulse" />Live</span>;
  }
  if (status === "bye") {
    return <span className="rounded-full bg-muted/30 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">BYE</span>;
  }
  return <span className="rounded-full bg-muted/20 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">Upcoming</span>;
}
