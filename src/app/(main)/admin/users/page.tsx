import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Users, Search, ShieldCheck, User, Trophy, Gamepad2 } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { UserRoleActions } from "./role-actions";

export const metadata = { title: "User Management — Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  const params = await searchParams;
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (params.role && params.role !== "all") filter.role = params.role;
  if (params.search) {
    filter.$or = [
      { username: { $regex: params.search, $options: "i" } },
      { full_name: { $regex: params.search, $options: "i" } },
    ];
  }

  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [count, userDocs] = await Promise.all([
    UserModel.countDocuments(filter),
    UserModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(pageSize).lean() as Promise<Array<Record<string, unknown>>>,
  ]);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const users = userDocs.map((u) => ({
    id: String(u._id),
    username: String(u.username ?? ""),
    full_name: (u.full_name as string | null) ?? null,
    role: String(u.role ?? "player"),
    games_played: Number(u.games_played ?? 0),
    games_won: Number(u.games_won ?? 0),
    created_at: String(u.created_at ?? new Date().toISOString()),
  }));

  const roleFilters: (UserRole | "all")[] = ["all", "admin", "player"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User <span className="text-gradient-primary">Management</span></h1>
        <p className="mt-1 text-muted-foreground">View and manage user accounts and roles</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1" action={ROUTES.ADMIN_USERS}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="search" type="text" placeholder="Search users…" defaultValue={params.search ?? ""}
            className="w-full rounded-lg border border-border/50 bg-card/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          {params.role && <input type="hidden" name="role" value={params.role} />}
        </form>
        <div className="flex gap-2">
          {roleFilters.map((r) => {
            const isActive = r === "all" ? !params.role || params.role === "all" : params.role === r;
            return (
              <a key={r} href={`${ROUTES.ADMIN_USERS}?role=${r}${params.search ? `&search=${params.search}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${isActive ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent"}`}>
                {r === "all" ? "All" : r === "admin" ? "Admins" : "Players"}
              </a>
            );
          })}
        </div>
      </div>

      {users.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Stats</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const winRate = u.games_played > 0 ? Math.round((u.games_won / u.games_played) * 100) : 0;
                  const isCurrentUser = u.id === user.id;
                  return (
                    <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="h-4 w-4" /></div>
                          <div>
                            <p className="font-medium">{u.username}{isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</p>
                            {u.full_name && <p className="text-xs text-muted-foreground">{u.full_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                          {u.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Gamepad2 className="h-3 w-3" />}
                          {u.role === "admin" ? "Admin" : "Player"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Gamepad2 className="h-3 w-3" />{u.games_played}</span>
                          <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{u.games_won}</span>
                          <span className="font-mono">{winRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        {!isCurrentUser && <UserRoleActions userId={u.id} currentRole={u.role as UserRole} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`${ROUTES.ADMIN_USERS}?page=${p}${params.role ? `&role=${params.role}` : ""}${params.search ? `&search=${params.search}` : ""}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${p === page ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
