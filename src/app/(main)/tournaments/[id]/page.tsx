import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, ParticipantModel } from "@/lib/models";
import { UserModel } from "@/lib/models";
import { notFound } from "next/navigation";
import {
  Trophy, Calendar, Users, Gamepad2, Clock, Shield, FileText, ChevronRight, Zap, DollarSign,
} from "lucide-react";
import { TOURNAMENT_FORMAT_LABELS, SUPPORTED_GAMES } from "@/lib/constants";
import type { TournamentStatus, TournamentFormat } from "@/lib/types";
import { RegisterButton } from "./register-button";
import { HostControls } from "./host-controls";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const doc = await TournamentModel.findById(id).select("title game_name").lean() as { title?: string; game_name?: string } | null;
  return {
    title: doc?.title ?? "Tournament",
    description: `${doc?.game_name ?? "Gaming"} tournament on Arena`,
  };
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();

  const doc = await TournamentModel.findById(id).lean() as Record<string, unknown> | null;
  if (!doc) notFound();

  // Fetch creator username
  const creator = doc.created_by
    ? (await UserModel.findById(doc.created_by).select("username").lean() as { username?: string } | null)
    : null;

  const tournament = {
    id: String(doc._id),
    created_by: String(doc.created_by ?? ""),
    title: String(doc.title ?? ""),
    description: (doc.description as string | null) ?? null,
    game_name: String(doc.game_name ?? ""),
    format: String(doc.format ?? ""),
    max_participants: Number(doc.max_participants ?? 0),
    current_participants: Number(doc.current_participants ?? 0),
    registration_opens_at: String(doc.registration_opens_at ?? ""),
    registration_closes_at: String(doc.registration_closes_at ?? ""),
    starts_at: String(doc.starts_at ?? ""),
    ends_at: (doc.ends_at as string | null) ?? null,
    rules: (doc.rules as string | null) ?? null,
    prize_description: (doc.prize_description as string | null) ?? null,
    status: String(doc.status ?? "draft"),
    seed_based: Boolean(doc.seed_based),
    group_count: (doc.group_count as number | null) ?? null,
    group_advance_count: (doc.group_advance_count as number | null) ?? null,
    creator_username: creator?.username ?? null,
  };

  const participantDocs = await ParticipantModel.find({ tournament_id: id }).sort({ seed: 1 }).lean() as Array<{
    _id: string; player_id: string; seed?: number | null; status: string;
  }>;

  // Fetch usernames for participants
  const participantUserIds = participantDocs.map((p) => p.player_id);
  const participantUsers = await UserModel.find({ _id: { $in: participantUserIds } })
    .select("_id username games_won").lean() as Array<{ _id: string; username?: string; games_won?: number }>;
  const userMap = new Map(participantUsers.map((u) => [String(u._id), u]));

  const participants = participantDocs.map((p) => {
    const u = userMap.get(p.player_id);
    return {
      id: String(p._id),
      player_id: p.player_id,
      seed: p.seed ?? null,
      status: p.status,
      username: u?.username ?? null,
      games_won: u?.games_won ?? 0,
    };
  });

  const user = await getSession();

  let isRegistered = false;
  if (user) {
    const participation = await ParticipantModel.findOne({ tournament_id: id, player_id: user.id }).lean();
    isRegistered = !!participation;
  }

  const status = tournament.status as TournamentStatus;
  const format = tournament.format as TournamentFormat;
  const isFull = tournament.current_participants >= tournament.max_participants;
  const canRegister = status === "registration_open" && !isFull && !isRegistered && !!user;
  const isHost = !!user && tournament.created_by === user.id;
  const fillPct = Math.round((tournament.current_participants / tournament.max_participants) * 100);

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

  return (
    <div className="space-y-8">
      {/* ── Hero banner ──────────────────────────── */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.63_0.26_285/0.12)] via-card/40 to-[oklch(0.72_0.16_200/0.06)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-[250px] w-[350px] rounded-full bg-[oklch(0.63_0.26_285/0.07)] blur-[80px]" />
        <div className={`h-1 w-full ${status === "in_progress" ? "bg-gradient-to-r from-primary via-accent-foreground to-primary/60" : status === "registration_open" ? "bg-gradient-to-r from-success/80 to-success/40" : "bg-gradient-to-r from-border/60 to-border/20"}`} />

        <div className="relative p-7 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={`status-badge border ${statusInfo.className}`}>
                  {statusInfo.dot && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-status-pulse" />}
                  {statusInfo.label}
                </span>
                <span className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {TOURNAMENT_FORMAT_LABELS[format]}
                </span>
                <span className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {gameEmoji} {tournament.game_name}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tournament.title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Gamepad2 className="h-4 w-4 text-primary/60" />{tournament.game_name}</span>
                <span className="text-border/60">•</span>
                <span>Organized by <span className="font-medium text-foreground">{tournament.creator_username ?? "Unknown"}</span></span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <RegisterButton tournamentId={id} canRegister={canRegister} isRegistered={isRegistered} isFull={isFull} isLoggedIn={!!user} status={status} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Info cards ───────────────────────────── */}
      <div className="animate-fade-in-up animation-delay-100 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Users className="h-5 w-5" />} label="Participants" value={`${tournament.current_participants} / ${tournament.max_participants}`} accent="violet"
          extra={<div className="mt-3 progress-bar"><div className="progress-bar-fill" style={{ width: `${fillPct}%` }} /></div>} />
        <InfoCard icon={<Calendar className="h-5 w-5" />} label="Tournament Starts" value={new Date(tournament.starts_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} accent="cyan" />
        <InfoCard icon={<Clock className="h-5 w-5" />} label="Registration Closes" value={new Date(tournament.registration_closes_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} accent="gold" />
        <InfoCard icon={<DollarSign className="h-5 w-5" />} label="Prize Pool" value={tournament.prize_description ?? "—"} accent="green" />
      </div>

      {/* ── Description, Rules, Participants + Host Controls ─── */}
      <div className="animate-fade-in-up animation-delay-200 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {tournament.description && (
            <ContentCard icon={<FileText className="h-5 w-5 text-primary" />} title="About">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{tournament.description}</p>
            </ContentCard>
          )}
          {tournament.rules && (
            <ContentCard icon={<Shield className="h-5 w-5 text-primary" />} title="Rules">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{tournament.rules}</p>
            </ContentCard>
          )}
          {!tournament.description && !tournament.rules && (
            <ContentCard icon={<Zap className="h-5 w-5 text-primary" />} title="Details">
              <p className="text-sm text-muted-foreground">No additional details provided.</p>
            </ContentCard>
          )}
        </div>

        <div className="space-y-4">
          {isHost && (
            <HostControls tournamentId={id} status={status} participantCount={tournament.current_participants} />
          )}
          <div className="rounded-2xl border border-border/40 bg-card/25 p-5 backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15"><Users className="h-4 w-4 text-primary" /></div>
              Participants
              <span className="ml-auto rounded-full bg-muted/50 px-2 py-0.5 text-xs font-mono text-muted-foreground">{participants.length}</span>
            </h2>
            {participants.length > 0 ? (
              <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                {participants.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/35">
                    <span className="w-5 flex-shrink-0 text-center text-xs font-mono font-medium text-muted-foreground">{i + 1}</span>
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {(p.username ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{p.username ?? "Unknown"}</span>
                    {p.seed && <span className="text-xs text-muted-foreground">#{p.seed}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-8 text-center">
                <Users className="mb-2 h-8 w-8 text-muted-foreground/25" />
                <p className="text-sm text-muted-foreground">No participants yet</p>
                {status === "registration_open" && <p className="mt-1 text-xs text-muted-foreground/60">Be the first to register!</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const infoAccentMap: Record<string, { icon: string; bg: string }> = {
  violet: { icon: "text-primary",           bg: "bg-primary/12" },
  cyan:   { icon: "text-accent-foreground",  bg: "bg-accent-foreground/12" },
  gold:   { icon: "text-[oklch(0.78_0.18_85)]", bg: "bg-[oklch(0.78_0.18_85/0.12)]" },
  green:  { icon: "text-success",            bg: "bg-success/12" },
};

function InfoCard({ icon, label, value, accent, extra }: { icon: React.ReactNode; label: string; value: string; accent: string; extra?: React.ReactNode }) {
  const styles = infoAccentMap[accent] ?? infoAccentMap.violet;
  return (
    <div className="rounded-2xl border border-border/40 bg-card/25 p-4 backdrop-blur-sm">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${styles.bg}`}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
      {extra}
    </div>
  );
}

function ContentCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">{icon}</div>
        {title}
      </h2>
      {children}
    </div>
  );
}
