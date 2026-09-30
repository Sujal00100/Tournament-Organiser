import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, RoundModel, MatchModel, MatchPlayerModel, UserModel } from "@/lib/models";
import { redirect, notFound } from "next/navigation";
import { ROUTES, MATCH_STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft, Swords, Clock, CheckCircle2, XCircle, User } from "lucide-react";
import Link from "next/link";
import type { MatchStatus } from "@/lib/types";

export const metadata = { title: "Match Management — Admin" };

export default async function AdminMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  await connectDB();

  const tournamentDoc = await TournamentModel.findById(id).select("_id title format status").lean() as { _id: string; title?: string; format?: string; status?: string } | null;
  if (!tournamentDoc) notFound();

  const tournament = {
    id: String(tournamentDoc._id),
    title: String(tournamentDoc.title ?? ""),
    format: String(tournamentDoc.format ?? ""),
    status: String(tournamentDoc.status ?? ""),
  };

  const roundDocs = await RoundModel.find({ tournament_id: id })
    .sort({ bracket_side: 1, round_number: 1 }).lean() as Array<{
      _id: string; name: string; round_number: number; bracket_side: string;
    }>;

  const rounds = roundDocs.map((r) => ({
    id: String(r._id),
    name: r.name,
    round_number: r.round_number,
    bracket_side: r.bracket_side,
  }));

  const matchDocs = await MatchModel.find({ tournament_id: id })
    .sort({ match_number: 1 }).lean() as Array<{
      _id: string; match_number: number; status: string; winner_id: string | null;
      scheduled_at: string | null; admin_verified: boolean; round_id: string;
    }>;

  const matches = matchDocs.map((m) => ({
    id: String(m._id),
    match_number: m.match_number,
    status: m.status,
    winner_id: m.winner_id,
    scheduled_at: m.scheduled_at ?? null,
    admin_verified: m.admin_verified,
    round_id: String(m.round_id),
  }));

  const matchIds = matchDocs.map((m) => String(m._id));
  const playerDocs = await MatchPlayerModel.find({ match_id: { $in: matchIds } }).lean() as Array<{
    _id: string; match_id: string; player_id: string; score: number; slot: number; is_winner: boolean | null;
  }>;

  const playerUserIds = [...new Set(playerDocs.map((p) => p.player_id))];
  const userDocs = await UserModel.find({ _id: { $in: playerUserIds } }).select("_id username").lean() as Array<{ _id: string; username?: string }>;
  const userMap = new Map(userDocs.map((u) => [String(u._id), u.username ?? null]));

  const matchPlayers = playerDocs.map((p) => ({
    id: String(p._id),
    match_id: p.match_id,
    player_id: p.player_id,
    score: p.score,
    slot: p.slot,
    is_winner: p.is_winner,
    username: userMap.get(p.player_id) ?? null,
  }));

  // Group matches by round
  const matchesByRound = new Map<string, typeof matches>();
  for (const match of matches) {
    if (!matchesByRound.has(match.round_id)) matchesByRound.set(match.round_id, []);
    matchesByRound.get(match.round_id)!.push(match);
  }

  // Group players by match
  const playersByMatch = new Map<string, typeof matchPlayers>();
  for (const mp of matchPlayers) {
    if (!playersByMatch.has(mp.match_id)) playersByMatch.set(mp.match_id, []);
    playersByMatch.get(mp.match_id)!.push(mp);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href={ROUTES.ADMIN_TOURNAMENT(id)} className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/30 text-muted-foreground transition-all hover:bg-card/50 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Match <span className="text-gradient-primary">Management</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">{tournament.title}</p>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MatchStatCard label="Total Matches" value={matches.length} icon={<Swords className="h-4 w-4 text-primary" />} />
          <MatchStatCard label="Completed" value={matches.filter((m) => m.status === "completed").length} icon={<CheckCircle2 className="h-4 w-4 text-success" />} />
          <MatchStatCard label="Pending" value={matches.filter((m) => m.status === "scheduled" || m.status === "in_progress").length} icon={<Clock className="h-4 w-4 text-warning" />} />
        </div>
      )}

      {rounds.length > 0 ? (
        <div className="space-y-6">
          {rounds.map((round) => {
            const roundMatches = matchesByRound.get(round.id) ?? [];
            return (
              <div key={round.id} className="rounded-xl border border-border/50 bg-card/30 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Swords className="h-5 w-5 text-primary" />
                  {round.name}
                  {round.bracket_side !== "winners" && (
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{round.bracket_side}</span>
                  )}
                </h2>
                {roundMatches.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {roundMatches.map((match) => {
                      const players = playersByMatch.get(match.id) ?? [];
                      const player1 = players.find((p) => p.slot === 1);
                      const player2 = players.find((p) => p.slot === 2);
                      const matchStatus = match.status as MatchStatus;
                      return (
                        <div key={match.id} className={`rounded-lg border p-4 transition-all ${matchStatus === "in_progress" ? "border-primary/30 bg-primary/5" : matchStatus === "completed" ? "border-success/20 bg-success/5" : matchStatus === "bye" ? "border-muted/30 bg-muted/10 opacity-60" : "border-border/50 bg-muted/10"}`}>
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Match #{match.match_number}</span>
                            <MatchStatusBadge status={matchStatus} />
                          </div>
                          <div className="space-y-2">
                            <PlayerRow name={player1?.username ?? "TBD"} score={player1?.score ?? 0} isWinner={!!player1?.is_winner} isBye={matchStatus === "bye" && !player1} />
                            <div className="flex items-center gap-2"><div className="flex-1 border-t border-border/30" /><span className="text-xs font-bold text-muted-foreground">VS</span><div className="flex-1 border-t border-border/30" /></div>
                            <PlayerRow name={player2?.username ?? "TBD"} score={player2?.score ?? 0} isWinner={!!player2?.is_winner} isBye={matchStatus === "bye" && !player2} />
                          </div>
                          {matchStatus === "completed" && (
                            <div className="mt-3 flex items-center gap-1 text-xs">
                              {match.admin_verified ? (
                                <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" />Verified</span>
                              ) : (
                                <span className="flex items-center gap-1 text-warning"><Clock className="h-3 w-3" />Awaiting verification</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No matches in this round</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
          <Swords className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No fixtures generated yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Close registration and generate fixtures to see matches here</p>
        </div>
      )}
    </div>
  );
}

function MatchStatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4">
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span></div>
      <p className="mt-2 text-2xl font-bold font-mono">{value}</p>
    </div>
  );
}

function PlayerRow({ name, score, isWinner, isBye }: { name: string; score: number; isWinner: boolean; isBye: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-md px-3 py-2 ${isWinner ? "bg-success/10" : isBye ? "bg-muted/20 opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className={`text-sm ${isWinner ? "font-semibold text-success" : ""}`}>{isBye ? "BYE" : name}</span>
      </div>
      <span className="text-sm font-mono font-semibold">{score}</span>
    </div>
  );
}

function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const colors: Record<MatchStatus, string> = {
    scheduled:   "bg-muted/50 text-muted-foreground",
    in_progress: "bg-primary/10 text-primary",
    completed:   "bg-success/10 text-success",
    cancelled:   "bg-destructive/10 text-destructive",
    bye:         "bg-muted/30 text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[status]}`}>
      {MATCH_STATUS_LABELS[status] ?? status}
    </span>
  );
}
