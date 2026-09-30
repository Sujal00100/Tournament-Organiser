import { Swords, Trophy, Zap, Users, ChevronRight, Star, BarChart3, Bell } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-28 text-center">
        {/* Extra glow layers for hero */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.63_0.26_285/0.07)] blur-[120px]" />
        <div className="pointer-events-none absolute left-[20%] top-[60%] h-[300px] w-[300px] rounded-full bg-[oklch(0.72_0.16_200/0.05)] blur-[80px]" />

        {/* Badge */}
        <div className="animate-fade-in-up mb-7 inline-flex items-center gap-2 rounded-full border border-[oklch(0.63_0.26_285/0.25)] bg-[oklch(0.63_0.26_285/0.08)] px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
          <span className="status-live" />
          Real-time tournament management
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up animation-delay-100 max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-gradient-primary">Organize.</span>{" "}
          <span className="text-foreground">Compete.</span>{" "}
          <span className="text-gradient-primary">Dominate.</span>
        </h1>

        <p className="animate-fade-in-up animation-delay-200 mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          The all-in-one platform for gaming clubs to create tournaments,
          generate brackets, track live scores, and crown champions.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 glow-primary animate-pulse-glow"
          >
            Get Started Free
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/tournaments"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-card/70"
          >
            Browse Tournaments
          </Link>
        </div>

        {/* Social proof */}
        <div className="animate-fade-in-up animation-delay-400 mt-12 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {["V", "K", "S", "R", "M"].map((letter, i) => (
              <div
                key={letter}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/20 text-xs font-bold text-primary"
                style={{ zIndex: 5 - i }}
              >
                {letter}
              </div>
            ))}
          </div>
          <span>Join <strong className="text-foreground">2,000+</strong> players already competing</span>
          <div className="hidden items-center gap-1 sm:flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[oklch(0.78_0.18_85)] text-[oklch(0.78_0.18_85)]" />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ────────────────────────────── */}
      <section className="mx-auto mb-20 max-w-4xl px-4">
        <div className="grid grid-cols-3 divide-x divide-border/40 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm">
          {[
            { value: "500+", label: "Tournaments Hosted" },
            { value: "10K+", label: "Matches Played" },
            { value: "2K+", label: "Active Players" },
          ].map((stat) => (
            <div key={stat.label} className="py-7 text-center">
              <p className="text-3xl font-bold text-gradient-primary">{stat.value}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-28">
        <div className="mb-12 text-center">
          <p className="section-label mb-3">Everything you need</p>
          <h2 className="text-3xl font-bold tracking-tight">Built for serious competitors</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────── */}
      <section className="mx-auto mb-24 max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.63_0.26_285/0.25)] bg-gradient-to-br from-[oklch(0.63_0.26_285/0.12)] via-[oklch(0.13_0.015_260)] to-[oklch(0.13_0.015_250)] p-12 text-center">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-[oklch(0.63_0.26_285/0.08)] blur-[60px]" />
          </div>

          <div className="animate-float-slow relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 glow-primary">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-3 text-3xl font-bold">Ready to compete?</h2>
          <p className="mb-8 text-muted-foreground">
            Create your free account and join a tournament today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary"
          >
            Start for free
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: Swords,
    title: "Multiple Formats",
    description: "Single & double elimination, round robin, and group stage + knockout brackets.",
    accent: "violet",
  },
  {
    icon: Zap,
    title: "Live Scoring",
    description: "Real-time score updates broadcast instantly to all viewers without a refresh.",
    accent: "cyan",
  },
  {
    icon: Trophy,
    title: "Auto Brackets",
    description: "Automatic fixture generation with seeding, BYE handling, and advancement.",
    accent: "gold",
  },
  {
    icon: Users,
    title: "Player Profiles",
    description: "Track match history, win rates, tournament placements, and leaderboard rank.",
    accent: "green",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Push notifications 5 minutes before your match starts. Never miss a game.",
    accent: "violet",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "Complete management with score verification, audit logs, and user controls.",
    accent: "cyan",
  },
];

const accentMap: Record<string, { icon: string; bg: string; border: string }> = {
  violet: {
    icon: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20 group-hover:border-primary/40",
  },
  cyan: {
    icon: "text-accent-foreground",
    bg: "bg-accent-foreground/10",
    border: "border-accent-foreground/20 group-hover:border-accent-foreground/40",
  },
  gold: {
    icon: "text-[oklch(0.78_0.18_85)]",
    bg: "bg-[oklch(0.78_0.18_85/0.1)]",
    border: "border-[oklch(0.78_0.18_85/0.2)] group-hover:border-[oklch(0.78_0.18_85/0.4)]",
  },
  green: {
    icon: "text-success",
    bg: "bg-success/10",
    border: "border-success/20 group-hover:border-success/40",
  },
};

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const { icon: Icon, title, description, accent } = feature;
  const colors = accentMap[accent] ?? accentMap.violet;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card/25 p-6 transition-all duration-300 card-hover-lift ${colors.border}`}
      style={{
        animationDelay: `${index * 80}ms`,
        opacity: 0,
        animation: `fade-in-up 0.5s ease-out ${index * 80}ms forwards`,
      }}
    >
      {/* Gradient background on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse 200px 200px at 0% 0%, oklch(0.63 0.26 285 / 0.04), transparent)` }}
      />

      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg}`}>
        <Icon className={`h-5 w-5 ${colors.icon}`} />
      </div>

      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
