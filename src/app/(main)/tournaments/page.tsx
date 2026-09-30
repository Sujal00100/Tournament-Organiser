import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, ParticipantModel } from "@/lib/models";
import { Trophy, Calendar, Users, Search, Plus } from "lucide-react";
import Link from "next/link";
import { ROUTES, TOURNAMENT_FORMAT_LABELS, SUPPORTED_GAMES } from "@/lib/constants";
import type { TournamentStatus, TournamentFormat } from "@/lib/types";

export const metadata = {
  title: "Tournaments",
  description: "Browse and join gaming tournaments",
};

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; game?: string; search?: string }>;
}) {
  const params = await searchParams;
  const user = await getSession();

  await connectDB();

  // Build MongoDB filter
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.game)   filter.game_name = { $regex: params.game, $options: "i" };
  if (params.search) filter.title = { $regex: params.search, $options: "i" };

  const tournamentDocs = await TournamentModel.find(filter).sort({ starts_at: 1 }).lean() as Array<Record<string, unknown>>;

  // Collect creator IDs
  const { UserModel } = await import("@/lib/models");
  const creatorIds = [...new Set(tournamentDocs.map((t) => t.created_by as string).filter(Boolean))];
  const creators = await UserModel.find({ _id: { $in: creatorIds } }).select("_id username").lean() as Array<{ _id: string; username?: string }>;
  const creatorMap = new Map(creators.map((c) => [String(c._id), c.username ?? null]));

  const tournaments = tournamentDocs.map((t) => ({
    id: String(t._id),
    title: String(t.title ?? ""),
    game_name: String(t.game_name ?? ""),
    format: String(t.format ?? ""),
    status: String(t.status ?? "draft"),
    max_participants: Number(t.max_participants ?? 0),
    current_participants: Number(t.current_participants ?? 0),
    starts_at: String(t.starts_at ?? ""),
    prize_description: (t.prize_description as string | null) ?? null,
    creator_username: creatorMap.get(String(t.created_by ?? "")) ?? null,
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label mb-1.5">Compete</p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Tournaments</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Browse and register for upcoming competitions</p>
        </div>
        {user && (
          <Link href={ROUTES.TOURNAMENT_HOST} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary flex-shrink-0">
            <Plus className="h-4 w-4" /> Host Tournament
          </Link>
        )}
      </div>

      {/* ── Game filter chips ─────────────────────── */}
      <div className="animate-fade-in-up animation-delay-50 flex flex-wrap gap-2">
        <Link href="/tournaments" className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${!params.game ? "border-primary/60 bg-primary/10 text-primary" : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
          🎮 All Games
        </Link>
        {SUPPORTED_GAMES.map((game) => {
          const isActive = params.game === game.id;
          const href = isActive ? "/tournaments" : `/tournaments?game=${encodeURIComponent(game.id)}`;
          return (
            <Link key={game.id} href={href} className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${isActive ? "border-primary/60 bg-primary/10 text-primary" : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
              {game.emoji} {game.name}
            </Link>
          );
        })}
      </div>

      {/* Filters row */}
      <div className="animate-fade-in-up animation-delay-100 flex flex-wrap items-center gap-3">
        <form className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="search" type="text" placeholder="Search tournaments..." defaultValue={params.search ?? ""}
            className="w-full rounded-xl border border-border/50 bg-card/30 py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground backdrop-blur-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15" />
        </form>
        <StatusFilter current={params.status} game={params.game} />
      </div>

      {/* Tournament grid */}
      {tournaments.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament, i) => <TournamentCard key={tournament.id} tournament={tournament} index={i} />)}
        </div>
      ) : (
        <div className="animate-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-card/40">
            <Trophy className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-base font-semibold text-muted-foreground">No tournaments found</h3>
          <p className="mt-1 text-sm text-muted-foreground/60">
            {params.search || params.status || params.game ? "Try adjusting your filters" : "Check back later for upcoming tournaments"}
          </p>
          {user && (
            <Link href={ROUTES.TOURNAMENT_HOST} className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15">
              <Plus className="h-4 w-4" /> Be the first to host one!
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function TournamentCard({ tournament, index }: { tournament: { id: string; title: string; game_name: string; format: string; status: string; max_participants: number; current_participants: number; starts_at: string; prize_description: string | null }; index: number }) {
  const status = tournament.status as TournamentStatus;
  const format = tournament.format as TournamentFormat;
  const gameEmoji = SUPPORTED_GAMES.find((g) => g.id.toLowerCase() === tournament.game_name?.toLowerCase())?.emoji ?? "🎮";

  const statusConfig: Record<string, { label: string; className: string; dot?: boolean }> = {
    draft:               { label: "Draft",             className: "bg-muted/50 text-muted-foreground border-border/30" },
    registration_open:   { label: "Registration Open", className: "bg-success/10 text-success border-success/25", dot: true },
    registration_closed: { label: "Reg. Closed",       className: "bg-warning/10 text-warning border-warning/25" },
    in_progress:         { label: "Live",              className: "bg-primary/10 text-primary border-primary/25", dot: true },
    completed:           { label: "Completed",         className: "bg-muted/50 text-muted-foreground border-border/30" },
    cancelled:           { label: "Cancelled",         className: "bg-destructive/10 text-destructive border-destructive/25" },
  };
  const statusInfo = statusConfig[status] ?? statusConfig.draft;
  const capacity = tournament.current_participants;
  const maxCapacity = tournament.max_participants;
  const fillPct = Math.round((capacity / maxCapacity) * 100);
  const isFull = capacity >= maxCapacity;

  return (
    <Link href={ROUTES.TOURNAMENT(tournament.id)} className="group block" style={{ opacity: 0, animation: `fade-in-up 0.45s ease-out ${index * 60}ms forwards` }}>
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/25 backdrop-blur-sm transition-all duration-300 card-hover-lift hover:border-primary/25">
        <div className={`h-0.5 w-full ${status === "in_progress" ? "bg-gradient-to-r from-primary/80 via-primary to-accent-foreground/60" : status === "registration_open" ? "bg-gradient-to-r from-success/80 to-success/40" : status === "completed" ? "bg-gradient-to-r from-muted to-muted/40" : "bg-gradient-to-r from-border/60 to-border/20"}`} />
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className={`status-badge border ${statusInfo.className}`}>
              {statusInfo.dot && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-status-pulse" />}
              {statusInfo.label}
            </span>
            <span className="text-[11px] text-muted-foreground">{TOURNAMENT_FORMAT_LABELS[format] ?? format}</span>
          </div>
          <h3 className="mb-1.5 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{tournament.title}</h3>
          <p className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground"><span>{gameEmoji}</span>{tournament.game_name}</p>
          {tournament.prize_description && (
            <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-[oklch(0.78_0.18_85/0.08)] px-2.5 py-1.5 text-xs font-medium text-[oklch(0.78_0.18_85)]">
              🏆 {tournament.prize_description}
            </p>
          )}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{capacity} / {maxCapacity} players</span>
              {isFull && <span className="font-medium text-warning">Full</span>}
            </div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${fillPct}%` }} /></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {tournament.starts_at ? new Date(tournament.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusFilter({ current, game }: { current?: string; game?: string }) {
  const statuses = [
    { value: "", label: "All" },
    { value: "registration_open", label: "Open" },
    { value: "in_progress", label: "🔴 Live" },
    { value: "completed", label: "Past" },
  ];
  function buildHref(statusValue: string) {
    const p = new URLSearchParams();
    if (statusValue) p.set("status", statusValue);
    if (game) p.set("game", game);
    const qs = p.toString();
    return qs ? `/tournaments?${qs}` : "/tournaments";
  }
  return (
    <div className="flex gap-0.5 rounded-xl border border-border/40 bg-card/30 p-1 backdrop-blur-sm">
      {statuses.map((s) => (
        <Link key={s.value} href={buildHref(s.value)} className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${(current ?? "") === s.value ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
          {s.label}
        </Link>
      ))}
    </div>
  );
}
