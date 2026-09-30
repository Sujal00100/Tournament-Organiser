import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TournamentModel, ParticipantModel, MatchModel } from "@/lib/models";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import {
  Trophy, Users, Swords, ShieldCheck, Activity, Clock, Plus, ArrowRight, TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  await connectDB();

  const now = new Date().toISOString();
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { UserModel } = await import("@/lib/models");

  const [
    activeTournaments,
    totalTournaments,
    totalUsers,
    pendingVerifications,
    upcomingMatches,
  ] = await Promise.all([
    TournamentModel.countDocuments({ status: "in_progress" }),
    TournamentModel.countDocuments({}),
    UserModel.countDocuments({}),
    MatchModel.countDocuments({ status: "completed", admin_verified: false }),
    MatchModel.countDocuments({ status: "scheduled", scheduled_at: { $gte: now, $lte: in24h } }),
  ]);

  // Recent registrations
  const recentParticipantDocs = await ParticipantModel.find({})
    .sort({ registered_at: -1 }).limit(5).lean() as Array<{ _id: string; player_id: string; tournament_id: string; registered_at: string }>;

  const regPlayerIds = recentParticipantDocs.map((p) => p.player_id);
  const regTournamentIds = recentParticipantDocs.map((p) => p.tournament_id);

  const [regUsers, regTournaments] = await Promise.all([
    UserModel.find({ _id: { $in: regPlayerIds } }).select("_id username").lean() as Promise<Array<{ _id: string; username?: string }>>,
    TournamentModel.find({ _id: { $in: regTournamentIds } }).select("_id title").lean() as Promise<Array<{ _id: string; title?: string }>>,
  ]);

  const regUserMap = new Map(regUsers.map((u) => [String(u._id), u.username ?? null]));
  const regTournamentMap = new Map(regTournaments.map((t) => [String(t._id), t.title ?? null]));

  const recentRegistrations = recentParticipantDocs.map((p) => ({
    id: String(p._id),
    registered_at: p.registered_at,
    player_username: regUserMap.get(p.player_id) ?? null,
    tournament_title: regTournamentMap.get(p.tournament_id) ?? null,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-label mb-1.5">Management</p>
          <h1 className="text-3xl font-bold tracking-tight">Admin <span className="text-gradient-primary">Dashboard</span></h1>
          <p className="mt-1 text-muted-foreground">System overview and tournament management</p>
        </div>
        <Link href={ROUTES.ADMIN_TOURNAMENT_NEW} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary">
          <Plus className="h-4 w-4" /> New Tournament
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { icon: Activity,    label: "Active Tournaments",   value: activeTournaments,    accent: "violet", href: ROUTES.ADMIN_TOURNAMENTS, delay: "0ms" },
          { icon: Trophy,      label: "Total Tournaments",    value: totalTournaments,     accent: "cyan",   href: ROUTES.ADMIN_TOURNAMENTS, delay: "60ms" },
          { icon: Users,       label: "Total Users",          value: totalUsers,           accent: "green",  href: ROUTES.ADMIN_USERS,        delay: "120ms" },
          { icon: ShieldCheck, label: "Pending Verification", value: pendingVerifications, accent: "gold",   delay: "180ms" },
          { icon: Clock,       label: "Upcoming (24h)",       value: upcomingMatches,      accent: "red",    delay: "240ms" },
        ].map((stat) => <AdminStatCard key={stat.label} {...stat} />)}
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <div className="animate-fade-in-up animation-delay-200 rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15"><Users className="h-4 w-4 text-success" /></div>
              Recent Registrations
            </h2>
          </div>
          {recentRegistrations.length > 0 ? (
            <div className="space-y-2">
              {recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-3 rounded-xl bg-muted/20 px-4 py-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-bold text-success">
                    {(reg.player_username ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{reg.player_username ?? "Unknown"}</p>
                    <p className="truncate text-xs text-muted-foreground">→ {reg.tournament_title ?? "Unknown Tournament"}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{formatRelativeTime(reg.registered_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No recent registrations" icon={<Users className="h-8 w-8 text-muted-foreground/25" />} />
          )}
        </div>

        {/* Quick actions */}
        <div className="animate-fade-in-up animation-delay-300 grid gap-4 grid-cols-2 content-start">
          {[
            { href: ROUTES.ADMIN_TOURNAMENT_NEW, icon: Plus,       label: "Create Tournament", description: "Set up a new tournament event" },
            { href: ROUTES.ADMIN_TOURNAMENTS,    icon: Trophy,     label: "Manage Tournaments", description: "View and edit all tournaments" },
            { href: ROUTES.ADMIN_USERS,          icon: Users,      label: "Manage Users",       description: "View and manage user roles" },
            { href: ROUTES.ADMIN_AUDIT_LOGS,     icon: ShieldCheck,label: "Audit Logs",         description: "Review system activity logs" },
          ].map((action) => <QuickAction key={action.href} {...action} />)}
        </div>
      </div>
    </div>
  );
}

const adminStatAccents: Record<string, { icon: string; bg: string; border: string }> = {
  violet: { icon: "text-primary",       bg: "bg-primary/12",       border: "border-primary/15" },
  cyan:   { icon: "text-accent-foreground", bg: "bg-accent-foreground/12", border: "border-accent-foreground/15" },
  green:  { icon: "text-success",        bg: "bg-success/12",        border: "border-success/15" },
  gold:   { icon: "text-[oklch(0.78_0.18_85)]", bg: "bg-[oklch(0.78_0.18_85/0.12)]", border: "border-[oklch(0.78_0.18_85/0.15)]" },
  red:    { icon: "text-destructive",    bg: "bg-destructive/12",    border: "border-destructive/15" },
};

function AdminStatCard({ icon: Icon, label, value, accent, href, delay }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; accent: string; href?: string; delay?: string }) {
  const styles = adminStatAccents[accent] ?? adminStatAccents.violet;
  const content = (
    <div className={`rounded-2xl border ${styles.border} bg-card/25 p-5 backdrop-blur-sm transition-all card-hover`} style={delay ? { opacity: 0, animation: `fade-in-up 0.5s ease-out ${delay} forwards` } : undefined}>
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${styles.bg}`}><Icon className={`h-5 w-5 ${styles.icon}`} /></div>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickAction({ href, icon: Icon, label, description }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; description: string }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-2xl border border-border/40 bg-card/25 p-4 backdrop-blur-sm transition-all duration-200 card-hover hover:border-primary/25">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20"><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-10 text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
