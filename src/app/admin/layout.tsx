import Link from "next/link";
import { LogOut, LayoutDashboard, ScanLine } from "lucide-react";
import { getAdminUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="border-b border-blue-100 bg-brand-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-blue-200">Buzz Thru Admin</p>
            <h1 className="text-lg font-semibold">Booking Dashboard</h1>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <nav className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Bookings
                </Link>
                <Link
                  href="/admin/check-in"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
                >
                  <ScanLine className="h-4 w-4" />
                  Check-In
                </Link>
              </nav>
              <a
                href="/api/auth/logout"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </a>
            </div>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
