"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { ChevronDown } from "lucide-react";
import { nav, site } from "@/lib/site";

export type NavCategory = { slug: string; name: string };

const TICKER_MESSAGES = [
  "Quality First",
  "Customer Satisfaction",
  "Professional Efficiency",
  "Clinical Reliability",
];

export function SiteHeader({ logo, categories = [] }: { logo: React.ReactNode; categories?: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerFade, setTickerFade] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const interval = setInterval(() => {
      setTickerFade(false);
      timeout = setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
        setTickerFade(true);
      }, 300);
    }, 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  // "/" is a prefix of every route, so the home link has to match exactly or
  // it reads as the current page everywhere.
  const isCurrent = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const trigger = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menu) return;
    function keydown(event: KeyboardEvent) { if (event.key === "Escape") setMenu(false); }
    function outside(event: PointerEvent) { if (!menuRef.current?.contains(event.target as Node)) setMenu(false); }
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("pointerdown", outside); };
  }, [menu]);

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5">
        <Link prefetch={false} href="/" aria-label={`${site.name} home`} className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          {logo}
          <span className="sr-only">{site.name} home</span>
        </Link>

        {/* Animated Tagline Ticker for Mobile Header Gap */}
        <Link
          href="/about"
          prefetch={false}
          aria-label={`STEM MEDICA: ${TICKER_MESSAGES[tickerIndex]}`}
          className="mx-auto flex h-7 shrink min-w-0 max-w-[155px] sm:max-w-[190px] items-center gap-1.5 overflow-hidden rounded-full border border-hair/80 bg-paper/70 px-2.5 shadow-2xs backdrop-blur-xs transition-colors hover:border-navy/30 hover:bg-white lg:hidden"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-scarlet" aria-hidden="true" />
          <span
            className={`truncate text-[10px] sm:text-[10.5px] font-medium tracking-tight text-ink-soft transition-all duration-300 ease-out ${
              tickerFade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            }`}
          >
            {TICKER_MESSAGES[tickerIndex]}
          </span>
        </Link>


        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          {nav.filter((i) => !("cta" in i)).map((item) => {
            const link = `label inline-flex min-h-11 items-center whitespace-nowrap transition-colors duration-200 hover:text-scarlet ${
              isCurrent(item.href) ? "text-navy underline underline-offset-8 decoration-scarlet decoration-2" : "text-ink-soft"
            }`;
            // Products keeps its own link and gains a separate disclosure beside
            // it, so the department list never costs anyone the catalogue page.
            if (item.href === "/products" && categories.length) {
              return (
                <div key={item.href} ref={menuRef} className="relative flex items-center gap-1">
                  <Link href={item.href} prefetch={false} aria-current={isCurrent(item.href) ? "page" : undefined} className={link}>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMenu((value) => !value)}
                    aria-expanded={menu}
                    aria-controls="products-menu"
                    aria-label={menu ? "Hide departments" : "Show departments"}
                    className="flex size-8 items-center justify-center rounded-lg text-steel transition-colors duration-200 hover:bg-scarlet-tint hover:text-scarlet"
                  >
                    <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-300 ${menu ? "rotate-180" : ""}`} />
                  </button>
                  {/* Rendered whether or not it is open, and hidden with the
                      attribute. These are the only links to a department left
                      on the site, so they have to exist in the markup — and a
                      hidden subtree is correctly ignored by assistive tech. */}
                  <div hidden={!menu} id="products-menu" className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-hair bg-white py-1.5 shadow-[0_18px_44px_rgba(15,37,85,.16)]">
                      <Link href="/products" prefetch={false} onClick={() => setMenu(false)} className="block border-b border-hair px-4 py-2.5 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-scarlet-tint hover:text-scarlet">
                        All equipment
                      </Link>
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/products?cat=${encodeURIComponent(category.slug)}`}
                          prefetch={false}
                          onClick={() => setMenu(false)}
                          className="block px-4 py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:bg-scarlet-tint hover:text-scarlet"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </div>
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href} prefetch={false} aria-current={isCurrent(item.href) ? "page" : undefined} className={link}>
                {item.label}
              </Link>
            );
          })}
          <a
            href={`tel:${site.phoneIntl}`}
            className="label inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-ink transition-colors duration-200 hover:text-scarlet"
          >
            {site.phone}
          </a>
          <Link
            href="/quote"
            prefetch={false}
            className="label inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-navy px-4 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-scarlet"
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
          className="-mr-1 flex shrink-0 min-h-10 items-center gap-2 rounded-full border border-hair bg-paper/80 px-3 text-xs font-semibold uppercase tracking-wider text-navy transition-colors duration-200 hover:border-scarlet/40 hover:bg-scarlet-tint hover:text-scarlet active:bg-scarlet/10 lg:hidden"
        >
          <span>{open ? "Close" : "Menu"}</span>
          <span className="relative block h-3.5 w-4 shrink-0 text-navy" aria-hidden="true">
            <span className={`absolute left-0 block h-0.5 w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 block h-0.5 w-4 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 block h-0.5 w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-150px)] overflow-y-auto border-t border-hair lg:hidden">
          {nav.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className="flex min-h-12 items-center justify-between border-b border-hair px-5 py-3 text-base text-ink-soft transition-colors duration-200 hover:text-scarlet aria-[current=page]:bg-scarlet-tint aria-[current=page]:font-semibold aria-[current=page]:text-scarlet"
              >
                {item.label}
                <span aria-hidden="true" className="text-current">→</span>
              </Link>
              {item.href === "/products" && categories.length ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMobileMenu((value) => !value)}
                    aria-expanded={mobileMenu}
                    aria-controls="mobile-departments"
                    className="flex min-h-12 w-full items-center justify-between border-b border-hair bg-paper px-5 py-3 text-left text-[15px] font-medium text-navy transition-colors duration-200 hover:text-scarlet"
                  >
                    Browse departments
                    <ChevronDown size={18} aria-hidden="true" className={`transition-transform duration-300 ${mobileMenu ? "rotate-180" : ""}`} />
                  </button>
                  <ul hidden={!mobileMenu} id="mobile-departments" className="border-b border-hair bg-paper py-1">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/products?cat=${encodeURIComponent(category.slug)}`}
                          prefetch={false}
                          onClick={() => { setOpen(false); setMobileMenu(false); }}
                          className="flex min-h-11 items-center px-5 py-2 pl-8 text-[15px] text-ink-soft transition-colors duration-200 hover:text-scarlet"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
