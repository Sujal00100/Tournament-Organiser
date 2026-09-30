import { connectDB } from "@/lib/mongodb";
import { UserModel, ParticipantModel, TournamentModel } from "@/lib/models";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Trophy, Gamepad2, TrendingUp, Calendar, Star, Shield, Swords } from "lucide-react";
import Link from "next/link";
import { ROUTES, SUPPORTED_GAMES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return {
    title: `${username} — Player Profile`,
    description: `View ${username}'s tournament stats and history on Arena`,
  };
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  await connectDB();

  const profileDoc = await UserModel.findOne({ username: { $regex: `^${username}$`, $options: "i" } }).lean() as Record<string, unknown> | null;
  if (!profileDoc) notFound();

  const profile = {
    id: String(profileDoc._id),
    username: String(profileDoc.username ?? ""),
    full_name: (profileDoc.full_name as string | null) ?? null,
    avatar_url: (profileDoc.avatar_url as string | null) ?? null,
    bio: (profileDoc.bio as string | null) ?? null,
    role: String(profileDoc.role ?? "player"),
    games_played: Number(profileDoc.games_played ?? 0),
    games_won: Number(profileDoc.games_won ?? 0),
    tournaments_played: Number(profileDoc.tournaments_played ?? 0),
    tournaments_won: Number(profileDoc.tournaments_won ?? 0),
    created_at: String(profileDoc.created_at ?? new Date().toISOString()),
  };

  // Get tournament participations with tournament info
  const participationDocs = await ParticipantModel.find({ player_id: profile.id })
    .sort({ registered_at: -1 }).limit(10).lean() as Array<{
      _id: string; final_placement: number | null; registered_at: string;
      tournament_id: string; status: string;
    }>;

  const tournamentIds = participationDocs.map((p) => p.tournament_id);
  const tournamentDocs = await TournamentModel.find({ _id: { $in: tournamentIds } })
    .select("_id title game_name status starts_at").lean() as Array<{
      _id: string; title?: string; game_name?: string; status?: string; starts_at?: string;
    }>;
  const tournamentMap = new Map(tournamentDocs.map((t) => [String(t._id), t]));

  const participations = participationDocs.map((p) => {
    const t = tournamentMap.get(p.tournament_id);
    return {
      id: String(p._id),
      final_placement: p.final_placement ?? null,
      registered_at: p.registered_at,
      tournament_id: p.tournament_id,
      tournament_title: t?.title ?? "Unknown Tournament",
      game_name: t?.game_name ?? "",
      status: t?.status ?? "completed",
      starts_at: t?.starts_at ?? "",
    };
  });

  const user = await getSession();
  const isOwnProfile = user?.id === profile.id;

  const winRate = profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;
  const initial = profile.username.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* ── Profile Hero ─────────────────────────── */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.63_0.26_285/0.12)] via-card/40 to-[oklch(0.72_0.16_200/0.06)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-[250px] w-[350px] rounded-full bg-[oklch(0.63_0.26_285/0.07)] blur-[80px]" />
        <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary/60 to-accent-foreground/40" />

        <div className="relative p-7 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary/30 text-3xl font-bold text-primary-foreground ring-4 ring-primary/20 shadow-2xl">
              {initial}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{profile.username}</h1>
                {profile.role === "admin" && (
                  <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
                {isOwnProfile && <span className="rounded-full border border-border/40 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">You</span>}
              </div>
              {profile.full_name && <p className="mt-0.5 text-sm text-muted-foreground">{profile.full_name}</p>}
              {profile.bio && <p className="mt-2 text-sm text-muted-foreground max-w-xl line-clamp-2">{profile.bio}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </p>
            </div>
            {isOwnProfile && (
              <Link href={ROUTES.DASHBOARD_PROFILE} className="flex-shrink-0 rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────── */}
      <div className="animate-fade-in-up animation-delay-100 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Gamepad2,   label: "Games Played",  value: profile.games_played,       accent: "violet" },
          { icon: Trophy,     label: "Games Won",      value: profile.games_won,           accent: "green"  },
          { icon: TrendingUp, label: "Win Rate",       value: `${winRate}%`,              accent: "gold"   },
          { icon: Calendar,   label: "Tournaments",    value: profile.tournaments_played,  accent: "cyan"   },
        ].map((stat, i) => <StatCard key={stat.label} {...stat} delay={`${i * 60}ms`} />)}
      </div>

      {/* ── Tournament History ────────────────────── */}
      <div className="animate-fade-in-up animation-delay-200 rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
        <h2 className="mb-5 flex items-center gap-2 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15"><Swords className="h-4 w-4 text-primary" /></div>
          Tournament History
          <span className="ml-auto rounded-full bg-muted/50 px-2 py-0.5 text-xs font-mono text-muted-foreground">{participations.length}</span>
        </h2>

        {participations.length > 0 ? (
          <div className="space-y-2.5">
            {participations.map((p) => {
              const gameEmoji = SUPPORTED_GAMES.find((g) => g.id.toLowerCase() === p.game_name?.toLowerCase())?.emoji ?? "🎮";
              const placementBadge = p.final_placement === 1
                ? { label: "🥇 1st", className: "bg-[oklch(0.78_0.18_85/0.12)] text-[oklch(0.78_0.18_85)] border-[oklch(0.78_0.18_85/0.3)]" }
                : p.final_placement === 2
                ? { label: "🥈 2nd", className: "bg-muted/50 text-muted-foreground border-border/30" }
                : p.final_placement === 3
                ? { label: "🥉 3rd", className: "bg-[oklch(0.67_0.16_55/0.12)] text-[oklch(0.67_0.16_55)] border-[oklch(0.67_0.16_55/0.3)]" }
                : null;

              return (
                <Link key={p.id} href={ROUTES.TOURNAMENT(p.tournament_id)} className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3 transition-all hover:border-primary/25 hover:bg-muted/30">
                  <span className="text-xl">{gameEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.tournament_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.game_name} · {p.starts_at ? new Date(p.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {placementBadge && (
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${placementBadge.className}`}>{placementBadge.label}</span>
                    )}
                    <StatusDot status={p.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-12 text-center">
            <Trophy className="mb-3 h-10 w-10 text-muted-foreground/25" />
            <p className="text-sm font-medium text-muted-foreground">No tournaments yet</p>
            <Link href={ROUTES.TOURNAMENTS} className="mt-3 text-sm font-medium text-primary hover:text-primary/80">Browse Tournaments →</Link>
          </div>
        )}
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
    <div className="rounded-2xl border border-border/40 bg-card/25 p-5 backdrop-blur-sm" style={{ opacity: 0, animation: `fade-in-up 0.5s ease-out ${delay} forwards` }}>
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${styles.bg}`}><Icon className={`h-5 w-5 ${styles.icon}`} /></div>
      <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-border/40">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${styles.bar}`} />
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string }> = {
    registration_open:   { dot: "bg-success",                       label: "Open" },
    in_progress:         { dot: "bg-primary animate-status-pulse",  label: "Live" },
    completed:           { dot: "bg-muted-foreground",              label: "Ended" },
    registration_closed: { dot: "bg-warning",                       label: "Closed" },
    cancelled:           { dot: "bg-destructive",                   label: "Cancelled" },
    draft:               { dot: "bg-muted-foreground",              label: "Draft" },
  };
  const info = map[status] ?? map.completed;
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} /> {info.label}
    </span>
  );
}
