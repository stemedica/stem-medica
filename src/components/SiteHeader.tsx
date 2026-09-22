"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { nav, site } from "@/lib/site";

export function SiteHeader({ logo }: { logo: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // "/" is a prefix of every route, so the home link has to match exactly or
  // it reads as the current page everywhere.
  const isCurrent = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const trigger = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    function keydown(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }
    function outside(event: PointerEvent) { if (!header.current?.contains(event.target as Node)) setOpen(false); }
    const desktop = matchMedia("(min-width: 1024px)");
    function resize() { if (desktop.matches) setOpen(false); }
    document.addEventListener("keydown", keydown); document.addEventListener("pointerdown", outside); desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("pointerdown", outside); desktop.removeEventListener("change", resize); };
  }, [open]);

  return (
    <header ref={header} className="sticky top-0 z-50 border-b border-hair bg-white/95 text-ink backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link prefetch={false} href="/" aria-label={`${site.name} home`} className="flex items-center" onClick={() => setOpen(false)}>
          {logo}
          <span className="sr-only">{site.name} home</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          {nav.filter((i) => !("cta" in i)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={`label inline-flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-navy ${
                isCurrent(item.href) ? "text-navy underline underline-offset-8" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-ink transition-colors hover:text-navy"
          >
            {site.phone}
          </a>
          <Link
            href="/quote"
            prefetch={false}
            className="label inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-navy px-4 py-2.5 font-semibold text-white transition-colors hover:bg-navy-deep"
          >
            Request a quote
          </Link>
        </nav>

        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-150px)] overflow-y-auto border-t border-hair lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className="flex min-h-12 items-center justify-between border-b border-hair px-5 py-3 text-base text-ink-soft aria-[current=page]:bg-navy-tint aria-[current=page]:font-semibold aria-[current=page]:text-navy"
            >
              {item.label}
              <span aria-hidden="true" className="text-navy">→</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
