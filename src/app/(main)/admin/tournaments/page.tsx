import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, UserModel } from "@/lib/models";
import { redirect } from "next/navigation";
import { ROUTES, TOURNAMENT_STATUS_LABELS, TOURNAMENT_FORMAT_LABELS } from "@/lib/constants";
import { Trophy, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import type { TournamentStatus } from "@/lib/types";

export const metadata = { title: "Manage Tournaments — Admin" };

export default async function AdminTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (params.status && params.status !== "all") filter.status = params.status;
  if (params.search) {
    filter.$or = [
      { title: { $regex: params.search, $options: "i" } },
      { game_name: { $regex: params.search, $options: "i" } },
    ];
  }

  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const [count, tournamentDocs] = await Promise.all([
    TournamentModel.countDocuments(filter),
    TournamentModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(pageSize).lean() as Promise<Array<Record<string, unknown>>>,
  ]);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // Fetch creator usernames
  const creatorIds = [...new Set(tournamentDocs.map((t) => t.created_by as string).filter(Boolean))];
  const creatorDocs = await UserModel.find({ _id: { $in: creatorIds } }).select("_id username").lean() as Array<{ _id: string; username?: string }>;
  const creatorMap = new Map(creatorDocs.map((c) => [String(c._id), c.username ?? null]));

  const tournaments = tournamentDocs.map((t) => ({
    id: String(t._id),
    title: String(t.title ?? ""),
    game_name: String(t.game_name ?? ""),
    format: String(t.format ?? ""),
    status: String(t.status ?? "draft"),
    max_participants: Number(t.max_participants ?? 0),
    current_participants: Number(t.current_participants ?? 0),
    creator_username: creatorMap.get(String(t.created_by ?? "")) ?? null,
  }));

  const statusFilters: (TournamentStatus | "all")[] = ["all", "draft", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-gradient-primary">Tournaments</span></h1>
          <p className="mt-1 text-muted-foreground">Create and manage tournament events</p>
        </div>
        <Link href={ROUTES.ADMIN_TOURNAMENT_NEW} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 glow-primary">
          <Plus className="h-4 w-4" /> New Tournament
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1" action={ROUTES.ADMIN_TOURNAMENTS}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="search" type="text" placeholder="Search tournaments…" defaultValue={params.search ?? ""}
            className="w-full rounded-lg border border-border/50 bg-card/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          {params.status && <input type="hidden" name="status" value={params.status} />}
        </form>
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 text-muted-foreground self-center mr-1" />
          {statusFilters.map((status) => {
            const isActive = status === "all" ? !params.status || params.status === "all" : params.status === status;
            const label = status === "all" ? "All" : TOURNAMENT_STATUS_LABELS[status] ?? status;
            return (
              <Link key={status} href={`${ROUTES.ADMIN_TOURNAMENTS}?status=${status}${params.search ? `&search=${params.search}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${isActive ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent"}`}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {tournaments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((t) => (
            <Link key={t.id} href={ROUTES.ADMIN_TOURNAMENT(t.id)} className="group rounded-xl border border-border/50 bg-card/30 p-5 transition-all hover:bg-card/50 hover:border-primary/30">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{TOURNAMENT_FORMAT_LABELS[t.format] ?? t.format}</span>
                </div>
                <StatusBadge status={t.status as TournamentStatus} />
              </div>
              <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.game_name}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.current_participants}/{t.max_participants} players</span>
                <span>by {t.creator_username ?? "Unknown"}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted/30">
                <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${Math.min(100, (t.current_participants / t.max_participants) * 100)}%` }} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No tournaments found</p>
          <Link href={ROUTES.ADMIN_TOURNAMENT_NEW} className="mt-4 inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80">
            <Plus className="h-4 w-4" /> Create your first tournament
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`${ROUTES.ADMIN_TOURNAMENTS}?page=${p}${params.status ? `&status=${params.status}` : ""}${params.search ? `&search=${params.search}` : ""}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${p === page ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: TournamentStatus }) {
  const colors: Record<TournamentStatus, string> = {
    draft:               "bg-muted/50 text-muted-foreground",
    registration_open:   "bg-success/10 text-success",
    registration_closed: "bg-warning/10 text-warning",
    in_progress:         "bg-primary/10 text-primary",
    completed:           "bg-accent text-accent-foreground",
    cancelled:           "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
      {TOURNAMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
