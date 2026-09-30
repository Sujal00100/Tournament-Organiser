import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Audit Logs — Admin" };

export default async function AdminAuditLogsPage() {
  const user = await getSession();
  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit <span className="text-gradient-primary">Logs</span></h1>
        <p className="mt-1 text-muted-foreground">Complete record of all system actions</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-20 text-center">
        <ShieldCheck className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-muted-foreground">Audit Logs Coming Soon</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground/70">
          System-level action logging will be available in a future update. Key actions like fixture generation, score updates, and match completions are already tracked internally.
        </p>
      </div>
    </div>
  );
}
