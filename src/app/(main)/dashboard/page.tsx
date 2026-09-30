import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { MatchModel, MatchPlayerModel, ParticipantModel, TournamentModel } from "@/lib/models";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import {
  Trophy,
  Gamepad2,
  TrendingUp,
  Calendar,
  Swords,
  BarChart3,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);

  await connectDB();

  // Upcoming matches for this player
  const playerMatchRecords = await MatchPlayerModel.find({ player_id: user.id }).lean() as Array<{ match_id: string }>;
  const matchIds = playerMatchRecords.map(mp => mp.match_id);

  const upcomingMatchDocs = await MatchModel.find({
    _id: { $in: matchIds }, status: "scheduled",
  }).sort({ scheduled_at: 1 }).limit(3).lean() as Array<{
    _id: string; scheduled_at?: string | null; tournament_id: string;
  }>;

  const tournamentTitleMap = new Map<string, string>();
  for (const m of upcomingMatchDocs) {
    if (!tournamentTitleMap.has(m.tournament_id)) {
      const t = await TournamentModel.findById(m.tournament_id).lean() as { title?: string } | null;
      if (t?.title) tournamentTitleMap.set(m.tournament_id, t.title);
    }
  }

  const upcomingMatches = upcomingMatchDocs.map(m => ({
    match_id: m._id,
    scheduled_at: m.scheduled_at ?? null,
    tournament_title: tournamentTitleMap.get(m.tournament_id) ?? "Unknown Tournament",
  }));

  // Recent results
  const completedMatchDocs = await MatchModel.find({
    _id: { $in: matchIds }, status: "completed",
  }).sort({ completed_at: -1 }).limit(5).lean() as Array<{ _id: string }>;

  const recentResults = await Promise.all(completedMatchDocs.map(async (m) => {
    const mp = await MatchPlayerModel.findOne({ match_id: m._id, player_id: user.id }).lean() as {
      score?: number; is_winner?: boolean | null;
    } | null;
    return {
      match_id: m._id,
      score: mp?.score ?? 0,
      is_winner: mp?.is_winner ?? null,
      status: "completed",
    };
  }));

  // Active tournaments count
  const activeTournaments = await ParticipantModel.countDocuments({
    player_id: user.id, status: { $in: ["registered", "checked_in", "active"] },
  });

  const winRate = user.games_played > 0 ? Math.round((user.games_won / user.games_played) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* ── Welcome ──────────────────────────────── */}
      <div className="animate-fade-in-up flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="text-gradient-primary">{user.username}</span>
          </h1>
        </div>
        <Link
          href={ROUTES.TOURNAMENTS}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/40 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          Browse tournaments
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Stats grid ───────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Gamepad2, label: "Games Played", value: user.games_played, accent: "violet", delay: "0ms" },
          { icon: Trophy,   label: "Games Won",    value: user.games_won,    accent: "green",  delay: "60ms" },
          { icon: TrendingUp, label: "Win Rate",   value: `${winRate}%`,     accent: "gold",   delay: "120ms" },
          { icon: Calendar, label: "Active Tournaments", value: activeTournaments, accent: "cyan", delay: "180ms" },
        ].map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Match cards ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming matches */}
        <div className="animate-fade-in-up animation-delay-200 rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <Swords className="h-4 w-4 text-primary" />
              </div>
              Upcoming Matches
            </h2>
            <Link href={ROUTES.DASHBOARD_MATCHES} className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingMatches.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingMatches.map((m) => (
                <div key={m.match_id} className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-muted/30">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Swords className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{m.tournament_title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "TBD"}
                    </p>
                  </div>
                  <span className="status-badge bg-primary/10 text-primary text-[10px]">Scheduled</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptySection icon={<Swords className="h-10 w-10 text-muted-foreground/25" />} message="No upcoming matches" linkLabel="Find a tournament" linkHref={ROUTES.TOURNAMENTS} />
          )}
        </div>

        {/* Recent results */}
        <div className="animate-fade-in-up animation-delay-300 rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                <BarChart3 className="h-4 w-4 text-success" />
              </div>
              Recent Results
            </h2>
            <Link href={ROUTES.DASHBOARD_MATCHES} className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentResults.length > 0 ? (
            <div className="space-y-2.5">
              {recentResults.map((mp) => (
                <div key={mp.match_id} className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${mp.is_winner ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {mp.is_winner ? "W" : "L"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Score: <span className="font-mono text-foreground">{mp.score}</span></p>
                  </div>
                  <span className={`status-badge text-[10px] ${mp.is_winner ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                    {mp.is_winner ? "WIN" : "LOSS"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptySection icon={<BarChart3 className="h-10 w-10 text-muted-foreground/25" />} message="No results yet" linkLabel="Browse tournaments" linkHref={ROUTES.TOURNAMENTS} />
          )}
        </div>
      </div>
    </div>
  );
}

const accentStyles: Record<string, { icon: string; bg: string; bar: string }> = {
  violet: { icon: "text-primary",         bg: "bg-primary/12",             bar: "from-primary to-primary/60" },
  green:  { icon: "text-success",          bg: "bg-success/12",             bar: "from-success to-success/60" },
  gold:   { icon: "text-[oklch(0.78_0.18_85)]", bg: "bg-[oklch(0.78_0.18_85/0.12)]", bar: "from-[oklch(0.78_0.18_85)] to-[oklch(0.78_0.18_85/0.6)]" },
  cyan:   { icon: "text-accent-foreground", bg: "bg-accent-foreground/12",  bar: "from-accent-foreground to-accent-foreground/60" },
};

function StatCard({ icon: Icon, label, value, accent, delay }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; accent: string; delay: string }) {
  const styles = accentStyles[accent] ?? accentStyles.violet;
  return (
    <div className="animate-fade-in-up rounded-2xl border border-border/40 bg-card/25 p-5 backdrop-blur-sm card-hover" style={{ animationDelay: delay, opacity: 0, animation: `fade-in-up 0.5s ease-out ${delay} forwards` }}>
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.bg}`}>
          <Icon className={`h-5 w-5 ${styles.icon}`} />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-border/40">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${styles.bar}`} />
      </div>
    </div>
  );
}

function EmptySection({ icon, message, linkLabel, linkHref }: { icon: React.ReactNode; message: string; linkLabel: string; linkHref: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-10 text-center">
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <Link href={linkHref} className="mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
