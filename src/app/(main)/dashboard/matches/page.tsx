import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { MatchPlayerModel, MatchModel, TournamentModel } from "@/lib/models";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Gamepad2, Trophy } from "lucide-react";

export const metadata = {
  title: "My Matches",
};

export default async function MatchesPage() {
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);

  await connectDB();

  const myMatchPlayers = await MatchPlayerModel.find({ player_id: user.id })
    .sort({ _id: -1 }).limit(20).lean() as Array<{ _id: string; match_id: string; score: number; slot: number; is_winner: boolean | null }>;

  const matchIds = myMatchPlayers.map((mp) => mp.match_id);
  const matchDocs = await MatchModel.find({ _id: { $in: matchIds } }).lean() as Array<{ _id: string; tournament_id: string; status: string; completed_at?: string | null }>;
  const matchMap = new Map(matchDocs.map((m) => [String(m._id), m]));

  const tournamentIds = [...new Set(matchDocs.map((m) => m.tournament_id))];
  const tournamentDocs = await TournamentModel.find({ _id: { $in: tournamentIds } }).select("_id title game_name").lean() as Array<{ _id: string; title?: string; game_name?: string }>;
  const tournamentMap = new Map(tournamentDocs.map((t) => [String(t._id), t]));

  const matchHistory = myMatchPlayers.map((mp) => {
    const match = matchMap.get(mp.match_id);
    const tournament = match ? tournamentMap.get(match.tournament_id) : null;
    return {
      match_id: mp.match_id,
      score: mp.score,
      slot: mp.slot,
      is_winner: mp.is_winner,
      status: match?.status ?? "scheduled",
      tournament_title: tournament?.title ?? "Unknown Tournament",
      game_name: tournament?.game_name ?? "",
    };
  }).sort((a, b) => {
    const ma = matchMap.get(a.match_id);
    const mb = matchMap.get(b.match_id);
    return (mb?.completed_at ?? "") > (ma?.completed_at ?? "") ? 1 : -1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient-primary">My Matches</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Your complete match history</p>
      </div>

      {matchHistory.length > 0 ? (
        <div className="space-y-3">
          {matchHistory.map((mp) => (
            <div
              key={mp.match_id}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-card/30 px-6 py-4 transition-colors hover:bg-card/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    mp.is_winner
                      ? "bg-success/10 text-success"
                      : mp.is_winner === false
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {mp.is_winner ? <Trophy className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{mp.tournament_title}</p>
                  <p className="text-xs text-muted-foreground">🎮 {mp.game_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-semibold">{mp.score}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    mp.is_winner
                      ? "bg-success/10 text-success"
                      : mp.is_winner === false
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {mp.is_winner ? "WIN" : mp.is_winner === false ? "LOSS" : mp.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
          <Gamepad2 className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-muted-foreground">No matches yet</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">Register for a tournament to start competing!</p>
        </div>
      )}
    </div>
  );
}
