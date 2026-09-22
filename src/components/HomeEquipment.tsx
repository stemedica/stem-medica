"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { homeEquipment } from "@/lib/home-equipment";
import { V2Photo } from "./V2";

/**
 * Browse by picking, not by scrolling a grid.
 *
 * Two dropdowns narrow to one item and the panel beside them shows it. The
 * card rail this replaced put six near-identical placeholder tiles on the
 * homepage, which said little and took most of a screen to say it.
 *
 * The photo panel is desktop only. On a phone it would push the controls
 * below the fold to show an image that is, for now, a placeholder.
 */
export function HomeEquipment({ groups }: { groups: ReturnType<typeof homeEquipment> }) {
  const [categorySlug, setCategorySlug] = useState("");
  const [productSlug, setProductSlug] = useState("");

  const current = groups.find(group => group.slug === categorySlug) ?? groups[0];
  // No effect needed to reset the product: a slug from the previous category
  // simply will not match, and the first item of the new one takes over.
  const chosen = current.products.find(product => product.slug === productSlug) ?? current.products[0];

  const selectCls = "site-select w-full min-h-12 truncate rounded-full py-2.5 pl-5 pr-11 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-55";

  return <section id="equipment" aria-labelledby="equipment-heading" className="border-b border-hair bg-white px-4 py-14 sm:px-6 lg:py-20">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">

      <div>
        <h2 id="equipment-heading" className="font-display text-3xl font-semibold leading-[1.06] tracking-[-.03em] text-navy sm:text-4xl lg:text-5xl">
          Explore our<br className="sm:hidden" /> equipment<span className="text-navy-2">.</span>
        </h2>
        <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Choose a category, then the item you are interested in. Ask us to confirm the model, price and delivery time — we supply, install and support everything listed here.
        </p>

        <div className="mt-8 grid gap-4 sm:max-w-md">
          <label className="block">
            <span className="text-sm font-medium text-ink">Category</span>
            <span className="relative mt-2 block">
              <select
                value={current.slug}
                onChange={event => { setCategorySlug(event.target.value); setProductSlug(""); }}
                className={selectCls}
              >
                {groups.map(group => <option key={group.slug} value={group.slug}>{group.name} ({group.count})</option>)}
              </select>
              <Chevron />
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Equipment</span>
            <span className="relative mt-2 block">
              <select
                value={chosen?.slug ?? ""}
                disabled={!chosen}
                onChange={event => setProductSlug(event.target.value)}
                className={selectCls}
              >
                {chosen
                  ? current.products.map(product => <option key={product.slug} value={product.slug}>{product.name}</option>)
                  : <option value="">Nothing listed yet</option>}
              </select>
              <Chevron />
            </span>
          </label>
        </div>

        <p role="status" aria-live="polite" aria-atomic="true" className="mt-4 text-sm text-steel">
          {current.count
            ? `${current.count} ${current.count === 1 ? "item" : "items"} in ${current.name.toLowerCase()}`
            : `Nothing listed in ${current.name.toLowerCase()} yet — try another category.`}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* A fixed label: putting the product name in the button made it
              resize on every change of the dropdown beside it. */}
          {chosen ? <Link prefetch={false} href={`/products/${chosen.slug}`} aria-label={`View ${chosen.name}`} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep">
            View equipment<ArrowRight size={17} aria-hidden="true" />
          </Link> : null}
          <Link prefetch={false} href={current.slug ? `/products?cat=${encodeURIComponent(current.slug)}` : "/products"} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4">
            {current.slug ? "See the whole category" : "Browse all equipment"}<ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="hidden lg:block">
        <V2Photo
          key={chosen?.slug ?? "empty"}
          src={chosen?.image}
          label={chosen ? `${chosen.name}: product photo` : "Equipment photo"}
          className="aspect-[4/5] w-full"
        />
        {chosen ? <div className="mt-5">
          <p className="font-display text-xl font-semibold leading-snug text-navy">{chosen.name}</p>
          <p className="mt-1 text-sm text-steel">{chosen.brand}</p>
          {chosen.summary ? <p className="mt-3 line-clamp-3 max-w-[54ch] text-[15px] leading-relaxed text-ink-soft">{chosen.summary}</p> : null}
        </div> : null}
      </div>

    </div>
  </section>;
}

/** The native arrow differs per platform; this keeps the control consistent. */
function Chevron() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy">
    <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
