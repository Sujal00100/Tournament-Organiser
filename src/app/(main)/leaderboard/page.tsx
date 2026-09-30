import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { Trophy, TrendingUp, ArrowRight } from "lucide-react";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Leaderboard",
  description: "Global player rankings by wins",
};

export default async function LeaderboardPage() {
  await connectDB();
  const rawPlayers = await UserModel.find({}).sort({ games_won: -1 }).limit(50).lean();
  const players: Profile[] = rawPlayers.map((p) => ({
    id: p._id as string,
    username: p.username as string,
    full_name: null,
    avatar_url: null,
    bio: null,
    role: "player" as const,
    games_played: (p.games_played as number) ?? 0,
    games_won: (p.games_won as number) ?? 0,
    tournaments_played: (p.tournaments_played as number) ?? 0,
    tournaments_won: (p.tournaments_won as number) ?? 0,
    created_at: (p.created_at as string) ?? new Date().toISOString(),
    updated_at: (p.updated_at as string) ?? new Date().toISOString(),
  }));

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <p className="section-label mb-1.5">Rankings</p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient-primary">Leaderboard</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Global player rankings by total wins
        </p>
      </div>

      {players.length > 0 ? (
        <>
          {/* ── Podium ─────────────────────────────────── */}
          {top3.length > 0 && (
            <div className="animate-fade-in-up animation-delay-100">
              <div className="flex items-end justify-center gap-3 sm:gap-6">
                {top3[1] && <PodiumCard player={top3[1]} rank={2} />}
                {top3[0] && <PodiumCard player={top3[0]} rank={1} />}
                {top3[2] && <PodiumCard player={top3[2]} rank={3} />}
              </div>
            </div>
          )}

          {/* ── Rankings table ─────────────────────────── */}
          {rest.length > 0 && (
            <div className="animate-fade-in-up animation-delay-200 overflow-hidden rounded-2xl border border-border/40 bg-card/25 backdrop-blur-sm">
              <div className="grid grid-cols-[3.5rem_1fr_5rem_5rem_5rem] gap-3 border-b border-border/30 bg-muted/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[3.5rem_1fr_6rem_6rem_6rem_6rem]">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Won</span>
                <span className="hidden text-right sm:block">Played</span>
                <span className="text-right">Win %</span>
                <span className="hidden text-right sm:block">🏆</span>
              </div>
              <div>
                {rest.map((player, index) => (
                  <LeaderboardRow key={player.id} player={player} rank={index + 4} isEven={index % 2 === 0} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="animate-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-card/40">
            <Trophy className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="font-medium text-muted-foreground">No players yet</p>
          <Link href={ROUTES.TOURNAMENTS} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
            Browse tournaments
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ player, rank }: { player: Profile; rank: number }) {
  const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;

  const rankConfigs: Record<number, { height: string; podiumHeight: string; icon: string; label: string; ring: string; bg: string; border: string; podiumBg: string }> = {
    1: { height: "h-44", podiumHeight: "h-20", icon: "🥇", label: "1st", ring: "ring-[oklch(0.78_0.18_85/0.4)]", bg: "bg-gradient-to-br from-[oklch(0.78_0.18_85/0.15)] to-[oklch(0.78_0.18_85/0.05)]", border: "border-[oklch(0.78_0.18_85/0.25)]", podiumBg: "bg-gradient-to-b from-[oklch(0.78_0.18_85/0.25)] to-[oklch(0.78_0.18_85/0.1)]" },
    2: { height: "h-36", podiumHeight: "h-14", icon: "🥈", label: "2nd", ring: "ring-[oklch(0.75_0.01_250/0.3)]", bg: "bg-gradient-to-br from-[oklch(0.75_0.01_250/0.1)] to-[oklch(0.75_0.01_250/0.03)]", border: "border-[oklch(0.75_0.01_250/0.2)]", podiumBg: "bg-gradient-to-b from-[oklch(0.75_0.01_250/0.2)] to-[oklch(0.75_0.01_250/0.08)]" },
    3: { height: "h-32", podiumHeight: "h-10", icon: "🥉", label: "3rd", ring: "ring-[oklch(0.65_0.12_55/0.3)]", bg: "bg-gradient-to-br from-[oklch(0.65_0.12_55/0.1)] to-[oklch(0.65_0.12_55/0.03)]", border: "border-[oklch(0.65_0.12_55/0.2)]", podiumBg: "bg-gradient-to-b from-[oklch(0.65_0.12_55/0.2)] to-[oklch(0.65_0.12_55/0.08)]" },
  };
  const cfg = rankConfigs[rank] ?? rankConfigs[3];

  return (
    <div className={`flex flex-col items-center ${rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3"} sm:order-none`}>
      <div className={`relative flex ${cfg.height} w-32 sm:w-40 flex-col items-center justify-end rounded-2xl border ${cfg.border} ${cfg.bg} px-3 pb-4 text-center transition-all duration-300 card-hover`}>
        <span className="absolute -top-3 text-2xl">{cfg.icon}</span>
        <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-card/60 text-lg font-bold ring-2 ${cfg.ring}`}>
          {player.username.charAt(0).toUpperCase()}
        </div>
        <p className="truncate text-sm font-semibold w-full text-center">{player.username}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{player.games_won}W · {winRate}%</p>
      </div>
      <div className={`${cfg.podiumHeight} w-32 sm:w-40 rounded-b-xl ${cfg.podiumBg} flex items-center justify-center border-x border-b ${cfg.border}`}>
        <span className="text-lg font-bold text-muted-foreground/60">{cfg.label}</span>
      </div>
    </div>
  );
}

function LeaderboardRow({ player, rank, isEven }: { player: Profile; rank: number; isEven: boolean }) {
  const winRate = player.games_played > 0 ? Math.round((player.games_won / player.games_played) * 100) : 0;

  return (
    <div className={`grid grid-cols-[3.5rem_1fr_5rem_5rem_5rem] gap-3 border-b border-border/10 px-6 py-3.5 transition-colors hover:bg-muted/15 sm:grid-cols-[3.5rem_1fr_6rem_6rem_6rem_6rem] ${isEven ? "" : "bg-muted/5"}`}>
      <div className="flex items-center">
        <span className="w-7 font-mono text-sm font-medium text-muted-foreground">{rank}</span>
      </div>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted/50 text-xs font-bold text-muted-foreground">
          {player.username.charAt(0).toUpperCase()}
        </div>
        <span className="truncate text-sm font-medium">{player.username}</span>
      </div>
      <div className="flex items-center justify-end font-mono text-sm font-semibold text-success">{player.games_won}</div>
      <div className="hidden items-center justify-end font-mono text-sm text-muted-foreground sm:flex">{player.games_played}</div>
      <div className="flex items-center justify-end gap-1.5">
        <div className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-border/50 sm:block">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent-foreground" style={{ width: `${winRate}%` }} />
        </div>
        <span className="font-mono text-sm">{winRate}%</span>
      </div>
      <div className="hidden items-center justify-end gap-1 font-mono text-sm text-warning sm:flex">
        <Trophy className="h-3.5 w-3.5 opacity-60" />
        {player.tournaments_won}
      </div>
    </div>
  );
}
