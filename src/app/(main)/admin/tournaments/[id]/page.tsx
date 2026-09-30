import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, ParticipantModel, MatchModel, UserModel } from "@/lib/models";
import { redirect, notFound } from "next/navigation";
import {
  ROUTES, TOURNAMENT_STATUS_LABELS, TOURNAMENT_FORMAT_LABELS, PARTICIPANT_STATUS_LABELS,
} from "@/lib/constants";
import { Trophy, ArrowLeft, Users, Calendar, Gamepad2, Swords, Clock, Award } from "lucide-react";
import Link from "next/link";
import type { TournamentStatus } from "@/lib/types";
import { TournamentStatusActions } from "./status-actions";

export const metadata = { title: "Manage Tournament — Admin" };

export default async function AdminTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  await connectDB();

  const doc = await TournamentModel.findById(id).lean() as Record<string, unknown> | null;
  if (!doc) notFound();

  const tournament = {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    game_name: String(doc.game_name ?? ""),
    format: String(doc.format ?? ""),
    status: String(doc.status ?? "draft"),
    max_participants: Number(doc.max_participants ?? 0),
    current_participants: Number(doc.current_participants ?? 0),
    registration_opens_at: String(doc.registration_opens_at ?? ""),
    registration_closes_at: String(doc.registration_closes_at ?? ""),
    starts_at: String(doc.starts_at ?? ""),
    description: (doc.description as string | null) ?? null,
    rules: (doc.rules as string | null) ?? null,
    prize_description: (doc.prize_description as string | null) ?? null,
    seed_based: Boolean(doc.seed_based),
    group_count: (doc.group_count as number | null) ?? null,
  };

  const participantDocs = await ParticipantModel.find({ tournament_id: id })
    .sort({ registered_at: 1 }).lean() as Array<{
      _id: string; player_id: string; status: string; seed?: number | null; registered_at: string;
    }>;

  const playerIds = participantDocs.map((p) => p.player_id);
  const playerDocs = await UserModel.find({ _id: { $in: playerIds } })
    .select("_id username games_won games_played").lean() as Array<{
      _id: string; username?: string; games_won?: number; games_played?: number;
    }>;
  const playerMap = new Map(playerDocs.map((u) => [String(u._id), u]));

  const participants = participantDocs.map((p) => {
    const u = playerMap.get(p.player_id);
    return {
      id: String(p._id),
      player_id: p.player_id,
      status: p.status,
      seed: p.seed ?? null,
      registered_at: p.registered_at,
      username: u?.username ?? null,
      games_won: u?.games_won ?? 0,
      games_played: u?.games_played ?? 0,
    };
  });

  const [totalMatches, completedMatches] = await Promise.all([
    MatchModel.countDocuments({ tournament_id: id }),
    MatchModel.countDocuments({ tournament_id: id, status: "completed" }),
  ]);

  const status = tournament.status as TournamentStatus;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href={ROUTES.ADMIN_TOURNAMENTS} className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/30 text-muted-foreground transition-all hover:bg-card/50 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{tournament.title}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {tournament.game_name} • {TOURNAMENT_FORMAT_LABELS[tournament.format] ?? tournament.format}
            </p>
          </div>
        </div>
        {(status === "in_progress" || status === "completed") && (
          <Link href={ROUTES.ADMIN_TOURNAMENT_MATCHES(id)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <Swords className="h-4 w-4" /> Manage Matches
          </Link>
        )}
      </div>

      <TournamentStatusActions tournamentId={id} currentStatus={status} participantCount={tournament.current_participants} />

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Users className="h-4 w-4" />} label="Participants" value={`${tournament.current_participants} / ${tournament.max_participants}`} />
        <InfoCard icon={<Gamepad2 className="h-4 w-4" />} label="Format" value={TOURNAMENT_FORMAT_LABELS[tournament.format] ?? tournament.format} />
        <InfoCard icon={<Swords className="h-4 w-4" />} label="Matches" value={totalMatches > 0 ? `${completedMatches} / ${totalMatches}` : "Not generated"} />
        <InfoCard icon={<Calendar className="h-4 w-4" />} label="Starts" value={new Date(tournament.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
      </div>

      {/* Schedule details */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5 text-primary" />Schedule</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registration Opens</p>
            <p className="mt-1 text-sm font-medium">{new Date(tournament.registration_opens_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registration Closes</p>
            <p className="mt-1 text-sm font-medium">{new Date(tournament.registration_closes_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tournament Start</p>
            <p className="mt-1 text-sm font-medium">{new Date(tournament.starts_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Description & Rules */}
      {(tournament.description || tournament.rules || tournament.prize_description) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {tournament.description && (
            <div className="rounded-xl border border-border/50 bg-card/30 p-6">
              <h3 className="mb-2 text-sm font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tournament.description}</p>
            </div>
          )}
          <div className="space-y-4">
            {tournament.rules && (
              <div className="rounded-xl border border-border/50 bg-card/30 p-6">
                <h3 className="mb-2 text-sm font-semibold">Rules</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tournament.rules}</p>
              </div>
            )}
            {tournament.prize_description && (
              <div className="rounded-xl border border-border/50 bg-card/30 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4 text-warning" />Prizes</h3>
                <p className="text-sm text-muted-foreground">{tournament.prize_description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants table */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Users className="h-5 w-5 text-primary" />Participants ({participants.length})</h2>
        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Player</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Seed</th>
                  <th className="pb-3 pr-4">Win Rate</th>
                  <th className="pb-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => {
                  const winRate = p.games_played > 0 ? Math.round((p.games_won / p.games_played) * 100) : 0;
                  return (
                    <tr key={p.id} className="border-b border-border/30 last:border-0">
                      <td className="py-3 pr-4 text-muted-foreground">{index + 1}</td>
                      <td className="py-3 pr-4 font-medium">{p.username ?? "Unknown"}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "active" || p.status === "registered" ? "bg-success/10 text-success" : p.status === "eliminated" ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground"}`}>
                          {PARTICIPANT_STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-muted-foreground">{p.seed ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-muted/30"><div className="h-full rounded-full bg-primary/60" style={{ width: `${winRate}%` }} /></div>
                          <span className="text-xs text-muted-foreground font-mono">{winRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{new Date(p.registered_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-8 text-center">
            <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No participants registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
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
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {TOURNAMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
