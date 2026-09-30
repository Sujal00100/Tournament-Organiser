// ═══════════════════════════════════════════════════════════
// Application Constants
// ═══════════════════════════════════════════════════════════

// ─── Tournament ──────────────────────────────────────────

export const TOURNAMENT_FORMAT_LABELS: Record<string, string> = {
  single_elimination: "Single Elimination",
  double_elimination: "Double Elimination",
  round_robin: "Round Robin",
  group_knockout: "Group Stage + Knockout",
} as const;

export const TOURNAMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export const MATCH_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  bye: "BYE",
} as const;

export const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  registered: "Registered",
  checked_in: "Checked In",
  eliminated: "Eliminated",
  active: "Active",
  withdrawn: "Withdrawn",
} as const;

// ─── Limits ──────────────────────────────────────────────

export const MAX_TOURNAMENT_PARTICIPANTS = 256;
export const MIN_TOURNAMENT_PARTICIPANTS = 2;
export const MAX_USERNAME_LENGTH = 30;
export const MAX_BIO_LENGTH = 500;
export const MAX_TOURNAMENT_TITLE_LENGTH = 100;
export const MAX_GAME_NAME_LENGTH = 50;

// ─── Pagination ──────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const AUDIT_LOG_PAGE_SIZE = 25;
export const MATCH_HISTORY_PAGE_SIZE = 20;

// ─── Group Stage ─────────────────────────────────────────

export const GROUP_STAGE_WIN_POINTS = 3;
export const GROUP_STAGE_DRAW_POINTS = 1;
export const GROUP_STAGE_LOSS_POINTS = 0;

// ─── Notification ────────────────────────────────────────

export const MATCH_REMINDER_MINUTES = 5;

// ─── Routes ──────────────────────────────────────────────

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  TOURNAMENTS: "/tournaments",
  TOURNAMENT: (id: string) => `/tournaments/${id}`,
  TOURNAMENT_BRACKET: (id: string) => `/tournaments/${id}/bracket`,
  TOURNAMENT_LEADERBOARD: (id: string) => `/tournaments/${id}/leaderboard`,
  TOURNAMENT_HOST: "/tournaments/host",
  LEADERBOARD: "/leaderboard",
  PLAYER: (id: string) => `/players/${id}`,
  PROFILE: (username: string) => `/profile/${username}`,
  DASHBOARD: "/dashboard",
  DASHBOARD_PROFILE: "/dashboard/profile",
  DASHBOARD_TOURNAMENTS: "/dashboard/tournaments",
  DASHBOARD_MATCHES: "/dashboard/matches",
  DASHBOARD_STATS: "/dashboard/stats",
  DASHBOARD_NOTIFICATIONS: "/dashboard/notifications",
  ADMIN: "/admin",
  ADMIN_TOURNAMENTS: "/admin/tournaments",
  ADMIN_TOURNAMENT_NEW: "/admin/tournaments/new",
  ADMIN_TOURNAMENT: (id: string) => `/admin/tournaments/${id}`,
  ADMIN_TOURNAMENT_MATCHES: (id: string) => `/admin/tournaments/${id}/matches`,
  ADMIN_TOURNAMENT_BRACKET: (id: string) => `/admin/tournaments/${id}/bracket`,
  ADMIN_USERS: "/admin/users",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
} as const;

// ─── Supported Games ─────────────────────────────────────

export const SUPPORTED_GAMES = [
  { id: "Valorant",       name: "Valorant",       emoji: "🎯", color: "from-red-500/20 to-rose-500/10" },
  { id: "CS2",            name: "CS2",            emoji: "💣", color: "from-orange-500/20 to-amber-500/10" },
  { id: "BGMI",           name: "BGMI",           emoji: "🔫", color: "from-yellow-500/20 to-lime-500/10" },
  { id: "Clash Royale",   name: "Clash Royale",   emoji: "⚔️", color: "from-blue-500/20 to-indigo-500/10" },
  { id: "Clash of Clans", name: "Clash of Clans", emoji: "🏰", color: "from-emerald-500/20 to-green-500/10" },
] as const;

export type SupportedGame = typeof SUPPORTED_GAMES[number]["id"];

// ─── Protected Route Patterns ────────────────────────────

export const AUTH_REQUIRED_PATTERNS = ["/dashboard", "/admin", "/tournaments/host"];

export const ADMIN_REQUIRED_PATTERNS = ["/admin"];
export const PUBLIC_ONLY_PATTERNS = ["/login", "/signup"];
