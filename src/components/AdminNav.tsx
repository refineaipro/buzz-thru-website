"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/admin",
    label: "Bookings",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/admin",
  },
  {
    href: "/admin/check-in",
    label: "Check-In",
    icon: ScanLine,
    isActive: (pathname: string) => pathname.startsWith("/admin/check-in"),
  },
] as const;

function useAdminLinks() {
  const pathname = usePathname();
  const hidden = pathname === "/admin/login";
  return { pathname, hidden };
}

export function AdminTopNav() {
  const { pathname, hidden } = useAdminLinks();
  if (hidden) return null;

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {links.map(({ href, label, icon: Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/20 text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBottomNav() {
  const { pathname, hidden } = useAdminLinks();
  if (hidden) return null;

  return (
    <nav
      aria-label="Admin navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-100 bg-white shadow-[0_-4px_20px_rgba(11,29,67,0.08)] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-lg">
        {links.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[4.5rem] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-semibold transition-colors",
                active
                  ? "text-brand-red"
                  : "text-slate-600 hover:bg-brand-light hover:text-brand-navy",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
