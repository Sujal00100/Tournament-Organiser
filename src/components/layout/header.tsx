"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  Trophy,
  LayoutDashboard,
  Users,
  Bell,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  Gamepad2,
  ChevronRight,
  User,
  Plus,
  Home,
} from "lucide-react";
import { useState, useTransition, useRef, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const playerNav = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Tournaments", href: ROUTES.TOURNAMENTS, icon: Trophy },
  { label: "My Matches", href: ROUTES.DASHBOARD_MATCHES, icon: Gamepad2 },
  { label: "Statistics", href: ROUTES.DASHBOARD_STATS, icon: BarChart3 },
  { label: "Leaderboard", href: ROUTES.LEADERBOARD, icon: Users },
  { label: "Notifications", href: ROUTES.DASHBOARD_NOTIFICATIONS, icon: Bell },
];

const adminNav = [
  { label: "Admin Overview", href: ROUTES.ADMIN, icon: Shield },
  { label: "Manage Tournaments", href: ROUTES.ADMIN_TOURNAMENTS, icon: Trophy },
  { label: "User Management", href: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Audit Logs", href: ROUTES.ADMIN_AUDIT_LOGS, icon: BarChart3 },
];

export function Header() {
  const { user, profile, isLoading } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Tournaments", href: ROUTES.TOURNAMENTS },
    { label: "Leaderboard", href: ROUTES.LEADERBOARD },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-2xl">
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-lg font-bold tracking-tight"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 transition-all duration-200 group-hover:bg-primary/25 group-hover:glow-primary">
            <Swords className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110" />
          </div>
          <span className="text-gradient-primary">Arena</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-28 animate-pulse rounded-lg bg-muted/60" />
          ) : user ? (
            <div className="hidden items-center gap-2 md:flex">
              {/* Notifications */}
              <Link
                href={ROUTES.DASHBOARD_NOTIFICATIONS}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>

              {/* Profile Dropdown */}
              <ProfileDropdown
                username={profile?.username ?? null}
                role={profile?.role ?? "player"}
              />
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button size="sm" className="glow-primary">
                  Get Started
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <MobileMenu
          user={user}
          profile={profile}
          pathname={pathname}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}

// ─── Profile Dropdown ────────────────────────────────────

function ProfileDropdown({
  username,
  role,
}: {
  username: string | null;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = username?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-[11px] font-bold text-primary-foreground ring-2 ring-primary/30">
          {initial}
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-success" />
        </div>
        <span className="max-w-[90px] truncate">{username ?? "Player"}</span>
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="border-b border-border/40 bg-muted/20 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {username ?? "Player"}
            </p>
            <p className="text-xs capitalize text-muted-foreground">{role}</p>
          </div>

          {/* Links */}
          <nav className="p-1.5">
            <DropdownLink
              href={ROUTES.DASHBOARD}
              icon={Home}
              label="Dashboard"
              onClick={() => setOpen(false)}
            />
            <DropdownLink
              href={ROUTES.DASHBOARD_PROFILE}
              icon={User}
              label="My Profile"
              onClick={() => setOpen(false)}
            />
            <DropdownLink
              href={ROUTES.TOURNAMENT_HOST}
              icon={Plus}
              label="Host Tournament"
              onClick={() => setOpen(false)}
              highlight
            />
            <DropdownLink
              href={ROUTES.TOURNAMENTS}
              icon={Trophy}
              label="Browse Tournaments"
              onClick={() => setOpen(false)}
            />
            {role === "admin" && (
              <DropdownLink
                href={ROUTES.ADMIN}
                icon={Shield}
                label="Admin Panel"
                onClick={() => setOpen(false)}
              />
            )}
          </nav>

          {/* Sign out */}
          <div className="border-t border-border/40 p-1.5">
            <SignOutButton variant="dropdown" onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownLink({
  href,
  icon: Icon,
  label,
  onClick,
  highlight = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        highlight
          ? "text-primary hover:bg-primary/10"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

// ─── Mobile Menu ─────────────────────────────────────────

function MobileMenu({
  user,
  profile,
  pathname,
  onClose,
}: {
  user: ReturnType<typeof useUser>["user"];
  profile: ReturnType<typeof useUser>["profile"];
  pathname: string;
  onClose: () => void;
}) {
  const isAdmin = profile?.role === "admin";

  return (
    <div className="animate-fade-in border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
      <nav className="space-y-0.5 p-3">
        {user ? (
          <>
            {/* User chip */}
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-3.5 py-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-sm font-bold text-primary-foreground ring-2 ring-primary/30">
                {profile?.username?.charAt(0).toUpperCase() ?? "?"}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">{profile?.username ?? "Player"}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role ?? "player"}</p>
              </div>
            </div>

            {playerNav.map((item) => (
              <MobileNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                onClick={onClose}
              />
            ))}

            {/* Host tournament */}
            <MobileNavLink
              href={ROUTES.TOURNAMENT_HOST}
              icon={Plus}
              label="Host a Tournament"
              active={pathname === ROUTES.TOURNAMENT_HOST}
              onClick={onClose}
              highlight
            />

            {isAdmin && (
              <>
                <div className="my-2 px-3">
                  <p className="section-label">Admin</p>
                </div>
                {adminNav.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={pathname.startsWith(item.href)}
                    onClick={onClose}
                  />
                ))}
              </>
            )}

            <div className="mt-2 border-t border-border/30 pt-2">
              <SignOutButton variant="mobile" />
            </div>
          </>
        ) : (
          <>
            <MobileNavLink href={ROUTES.TOURNAMENTS} icon={Trophy} label="Tournaments" active={pathname === ROUTES.TOURNAMENTS} onClick={onClose} />
            <MobileNavLink href={ROUTES.LEADERBOARD} icon={Users} label="Leaderboard" active={pathname === ROUTES.LEADERBOARD} onClick={onClose} />
            <div className="mt-3 flex gap-2 px-1">
              <Link href={ROUTES.LOGIN} className="flex-1" onClick={onClose}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href={ROUTES.SIGNUP} className="flex-1" onClick={onClose}>
                <Button className="w-full glow-primary">Get Started</Button>
              </Link>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  highlight = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-primary/10 text-primary"
          : highlight
          ? "text-primary hover:bg-primary/10"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      {active && (
        <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-primary" />
      )}
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

// ─── Sign Out Button ──────────────────────────────────────

function SignOutButton({
  variant = "desktop",
  onDone,
}: {
  variant?: "desktop" | "mobile" | "dropdown";
  onDone?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      onDone?.();
    });
  };

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {isPending ? "Signing out..." : "Sign Out"}
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {isPending ? "Signing out..." : "Sign Out"}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleSignOut}
      disabled={isPending}
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
