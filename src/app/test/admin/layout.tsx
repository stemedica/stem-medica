import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/guard";
import { SignOut } from "@/components/SignOut";
import { AdminNav } from "./AdminNav";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "STEM MEDICA Admin",
  // Private routes are also checked by the layout, pages, and API guards.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>
    <header className="no-print border-b border-hair bg-white"><div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 border-b border-hair py-2"><Link href="/test/admin" className="flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">STEM MEDICA <span className="border-l border-hair pl-2 text-xs font-normal text-steel">Admin</span></Link><a href="/test" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-navy">View website <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div>
      <div className="py-2"><AdminNav /></div>
    </div></header>
    {children}
    <footer className="no-print mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-hair px-5 py-4 text-sm text-ink-soft"><Link href="/test/auth/setup" className="inline-flex min-h-11 items-center underline underline-offset-4">Security</Link><SignOut /></footer>
  </>;
}
