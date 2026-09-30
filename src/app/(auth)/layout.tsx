import Link from "next/link";
import { Swords, Trophy, Zap, Users, Shield } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      {/* ── Left Branding Panel ─────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden bg-gradient-to-br from-[oklch(0.10_0.015_265)] via-[oklch(0.12_0.018_280)] to-[oklch(0.10_0.012_250)]">
        {/* Radial glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[10%] h-[480px] w-[480px] rounded-full bg-[oklch(0.63_0.26_285/0.12)] blur-[100px]" />
          <div className="absolute right-[-5%] bottom-[15%] h-[360px] w-[360px] rounded-full bg-[oklch(0.72_0.16_200/0.09)] blur-[80px]" />
          <div className="absolute left-[30%] bottom-[5%] h-[280px] w-[280px] rounded-full bg-[oklch(0.78_0.18_85/0.06)] blur-[70px]" />
        </div>

        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle 1px at center, oklch(0.95 0 0 / 0.06) 0%, transparent 100%)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Floating decorative icons */}
        <div className="animate-float absolute left-[12%] top-[18%] rounded-2xl border border-[oklch(0.63_0.26_285/0.2)] bg-[oklch(0.63_0.26_285/0.08)] p-3.5 backdrop-blur-sm" style={{ animationDelay: "0s" }}>
          <Trophy className="h-6 w-6 text-[oklch(0.78_0.18_85)]" />
        </div>
        <div className="animate-float absolute right-[18%] top-[30%] rounded-2xl border border-[oklch(0.72_0.16_200/0.2)] bg-[oklch(0.72_0.16_200/0.08)] p-3.5 backdrop-blur-sm" style={{ animationDelay: "2s" }}>
          <Zap className="h-6 w-6 text-[oklch(0.72_0.16_200)]" />
        </div>
        <div className="animate-float absolute left-[20%] bottom-[28%] rounded-2xl border border-[oklch(0.63_0.26_285/0.2)] bg-[oklch(0.63_0.26_285/0.08)] p-3.5 backdrop-blur-sm" style={{ animationDelay: "1.2s" }}>
          <Users className="h-6 w-6 text-[oklch(0.63_0.26_285)]" />
        </div>
        <div className="animate-float absolute right-[12%] bottom-[22%] rounded-2xl border border-[oklch(0.68_0.20_150/0.2)] bg-[oklch(0.68_0.20_150/0.08)] p-3.5 backdrop-blur-sm" style={{ animationDelay: "3s" }}>
          <Shield className="h-6 w-6 text-[oklch(0.68_0.20_150)]" />
        </div>

        {/* Content */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-12 text-center">
          {/* Logo */}
          <Link href="/" className="mb-10 flex items-center gap-2.5 text-2xl font-bold tracking-tight transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 glow-primary">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <span className="text-gradient-primary">Arena</span>
          </Link>

          {/* Hero text */}
          <h1 className="mb-4 max-w-sm text-4xl font-bold leading-tight tracking-tight text-foreground">
            Compete at the{" "}
            <span className="text-gradient-vivid">highest level</span>
          </h1>
          <p className="mb-12 max-w-xs text-base leading-relaxed text-muted-foreground">
            Join thousands of players in real-time tournaments with automatic brackets and live scoring.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-8">
            {[
              { label: "Tournaments", value: "500+" },
              { label: "Players", value: "2K+" },
              { label: "Matches", value: "10K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gradient-primary">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-border/30 px-12 py-5">
          <p className="text-center text-xs text-muted-foreground">
            Real-time brackets · Auto fixture generation · Push notifications
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="absolute left-6 top-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold transition-opacity hover:opacity-80">
            <Swords className="h-5 w-5 text-primary" />
            <span className="text-gradient-primary">Arena</span>
          </Link>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </div>
    </div>
  );
}
