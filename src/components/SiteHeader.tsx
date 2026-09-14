"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type React from "react";
import { nav, site } from "@/lib/site";

export function SiteHeader({ logo }: { logo: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-hair bg-white/95 text-ink backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          {logo}
          <span className="sr-only">{site.name} home</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`label transition-colors hover:text-navy ${
                pathname.startsWith(item.href) ? "text-scarlet" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${site.phoneIntl}`}
            className="label rounded-[2px] bg-scarlet px-4 py-2.5 font-semibold text-white transition-colors hover:bg-vital"
          >
            {site.phone}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open ? (
        <nav className="border-t border-hair md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="label flex items-center justify-between border-b border-hair px-5 py-4 text-ink-soft"
            >
              {item.label}
              <span aria-hidden="true" className="text-scarlet">→</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
