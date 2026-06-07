"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/MobileNav";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Hand Wash" },
  { href: "/self-serve", label: "Self-Serve" },
  { href: "/locations", label: "Locations" },
  { href: "/book", label: "Book Hand Wash" },
  { href: "/fleet", label: "Fleet" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt="Buzz Thru Car Wash"
            width={645}
            height={387}
            className="h-11 w-auto object-contain sm:h-14"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "bg-blue-50 text-brand-navy"
                  : "text-slate-600 hover:bg-blue-50 hover:text-brand-navy",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/book"
            className="rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 sm:px-4"
          >
            Book Hand Wash
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
