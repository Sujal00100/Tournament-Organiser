"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Gamepad2,
  BarChart3,
  Users,
  Bell,
  Shield,
  UserCog,
  FileText,
  ChevronLeft,
  ChevronRight,
  Swords,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { ROUTES } from "@/lib/constants";

const playerLinks = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Tournaments", href: ROUTES.TOURNAMENTS, icon: Trophy },
  { label: "Host Tournament", href: ROUTES.TOURNAMENT_HOST, icon: Plus },
  { label: "My Matches", href: ROUTES.DASHBOARD_MATCHES, icon: Gamepad2 },
  { label: "Statistics", href: ROUTES.DASHBOARD_STATS, icon: BarChart3 },
  { label: "Leaderboard", href: ROUTES.LEADERBOARD, icon: Users },
  { label: "Notifications", href: ROUTES.DASHBOARD_NOTIFICATIONS, icon: Bell },
];

const adminLinks = [
  { label: "Admin Overview", href: ROUTES.ADMIN, icon: Shield },
  { label: "Manage Tournaments", href: ROUTES.ADMIN_TOURNAMENTS, icon: Trophy },
  { label: "User Management", href: ROUTES.ADMIN_USERS, icon: UserCog },
  { label: "Audit Logs", href: ROUTES.ADMIN_AUDIT_LOGS, icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = profile?.role === "admin";

  return (
    <aside
      className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] flex-shrink-0 border-r border-border/40 bg-sidebar transition-all duration-300 ease-in-out lg:block ${
        collapsed ? "w-[60px]" : "w-56"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 py-3">
          {/* Player section */}
          {!collapsed && (
            <p className="section-label mb-2 px-3">Player</p>
          )}
          <div className="space-y-0.5">
            {playerLinks.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            ))}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className={`my-3 ${collapsed ? "mx-3" : "mx-2"} h-px bg-border/40`} />
              {!collapsed && (
                <p className="section-label mb-2 px-3">Admin</p>
              )}
              <div className="space-y-0.5">
                {adminLinks.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={pathname.startsWith(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer with logo + collapse toggle */}
        <div className="border-t border-border/40 p-2">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
                <Swords className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold text-gradient-primary">Arena</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg p-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
        collapsed ? "justify-center px-2" : ""
      } ${
        active
          ? "bg-primary/12 text-primary"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }`}
    >
      {/* Active left bar */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      <Icon
        className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 ${
          active ? "text-primary" : ""
        } ${!collapsed ? "group-hover:scale-110" : ""}`}
      />

      {!collapsed && <span className="truncate">{label}</span>}

      {/* Collapsed tooltip indicator */}
      {collapsed && active && (
        <span className="absolute right-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-l-full bg-primary" />
      )}
    </Link>
  );
}
