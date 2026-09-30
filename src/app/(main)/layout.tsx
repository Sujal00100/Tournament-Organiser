import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
