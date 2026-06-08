import { LogOut } from "lucide-react";
import { getAdminUser } from "@/lib/auth";
import { AdminBottomNav, AdminTopNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  return (
    <div className="min-h-screen bg-brand-light pb-24 lg:pb-0">
      <header className="border-b border-blue-100 bg-brand-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm text-blue-200">Buzz Thru Admin</p>
            <h1 className="truncate text-lg font-semibold">Booking Dashboard</h1>
          </div>
          {user ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <AdminTopNav />
              <a
                href="/api/auth/logout"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </a>
            </div>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      {user ? <AdminBottomNav /> : null}
    </div>
  );
}
