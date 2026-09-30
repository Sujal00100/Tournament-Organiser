import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { BarChart3, Trophy, Gamepad2, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Statistics",
};

export default async function StatsPage() {
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);

  const winRate = user.games_played > 0 ? Math.round((user.games_won / user.games_played) * 100) : 0;
  const lossRate = user.games_played > 0 ? 100 - winRate : 0;
  const tournamentWinRate = user.tournaments_played > 0 ? Math.round((user.tournaments_won / user.tournaments_played) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient-primary">Statistics</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Your detailed performance breakdown</p>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStatCard icon={<Gamepad2 className="h-6 w-6" />} label="Total Games"      value={user.games_played}    accent="primary" />
        <BigStatCard icon={<Trophy   className="h-6 w-6" />} label="Victories"         value={user.games_won}       accent="success" />
        <BigStatCard icon={<TrendingUp className="h-6 w-6" />} label="Win Rate"        value={`${winRate}%`}        accent="warning" />
        <BigStatCard icon={<BarChart3 className="h-6 w-6" />} label="Tournaments Won"  value={user.tournaments_won} accent="primary" />
      </div>

      {/* Win/Loss visual bar */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-6">
        <h2 className="mb-4 text-lg font-semibold">Win / Loss Ratio</h2>
        <div className="mb-2 flex gap-1 overflow-hidden rounded-full">
          {winRate > 0 && <div className="h-4 rounded-l-full bg-success transition-all" style={{ width: `${winRate}%` }} />}
          {lossRate > 0 && <div className="h-4 rounded-r-full bg-destructive transition-all" style={{ width: `${lossRate}%` }} />}
          {user.games_played === 0 && <div className="h-4 w-full rounded-full bg-muted" />}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-success">{user.games_won} wins ({winRate}%)</span>
          <span className="text-destructive">{user.games_played - user.games_won} losses ({lossRate}%)</span>
        </div>
      </div>

      {/* Tournament breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <h2 className="mb-4 text-lg font-semibold">Tournament Performance</h2>
          <div className="space-y-4">
            <StatRow label="Tournaments Entered"   value={user.tournaments_played} />
            <StatRow label="Tournaments Won"        value={user.tournaments_won} />
            <StatRow label="Tournament Win Rate"    value={`${tournamentWinRate}%`} />
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Stats</h2>
          <div className="space-y-4">
            <StatRow label="Games Played"     value={user.games_played} />
            <StatRow label="Games Won"        value={user.games_won} />
            <StatRow label="Games Lost"       value={user.games_played - user.games_won} />
            <StatRow label="Overall Win Rate" value={`${winRate}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BigStatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: "primary" | "success" | "warning" }) {
  const accentColors = { primary: "text-primary bg-primary/10", success: "text-success bg-success/10", warning: "text-warning bg-warning/10" };
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-6 transition-colors hover:bg-card/50">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${accentColors[accent]}`}>{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold font-mono tracking-tight">{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}
