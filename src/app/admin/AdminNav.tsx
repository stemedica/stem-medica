"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileText, Newspaper, Award } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/catalogue", label: "Catalogue", icon: Package },
  { href: "/admin/posts", label: "Updates & blog", icon: Newspaper },
  { href: "/admin/stories", label: "Achievements", icon: Award },
  { href: "/admin/proformas", label: "Proformas", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="Admin navigation" className="grid grid-cols-5 gap-1 sm:flex sm:gap-2">
    {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={(href === "/admin" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined} className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center text-[11px] font-medium text-ink-soft transition-colors hover:bg-navy-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy aria-[current=page]:bg-navy-tint aria-[current=page]:text-navy sm:min-h-11 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}
