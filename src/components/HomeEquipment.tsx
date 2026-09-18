"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, ImageIcon } from "lucide-react";
import type { homeEquipment } from "@/lib/home-equipment";
import { publicMediaUrl } from "@/lib/preview-paths";

export function HomeEquipment({ groups }: { groups: ReturnType<typeof homeEquipment> }) {
  const [selected, setSelected] = useState("");
  const [slide, setSlide] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const current = groups.find(group => group.slug === selected) ?? groups[0];
  function moveSlide(index: number) {
    const container = rail.current;
    const card = container?.children[index] as HTMLElement | undefined;
    if (!container || !card) return;
    container.scrollTo({ left: card.offsetLeft - (container.firstElementChild as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  const catalogueUrl = current.slug ? `/products?cat=${encodeURIComponent(current.slug)}` : "/products";
  return <section id="equipment" aria-labelledby="equipment-heading" className="border-b border-hair bg-white px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <h2 id="equipment-heading" className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl lg:text-6xl">Explore our<br className="sm:hidden" /> equipment<span className="text-navy-2">.</span></h2>
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-soft">Browse by category. When you find an item, ask us to confirm the model, price and delivery time.</p>
        </div>
        <Link href="/products" className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-navy underline underline-offset-4">Browse all equipment <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </header>
      <nav aria-label="Equipment categories" className="-mx-1 mt-7 flex gap-2 overflow-x-auto px-1 py-2 sm:mt-8 lg:flex-wrap">
        {groups.map(group => <a key={group.slug} href={group.slug ? `/products?cat=${encodeURIComponent(group.slug)}` : "/products"}
          aria-current={current.slug === group.slug ? "true" : undefined} aria-controls="home-equipment-results"
          onClick={event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); setSelected(group.slug); setSlide(0); }}
          className={`inline-flex min-h-11 max-w-[280px] shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${current.slug === group.slug ? "border-navy bg-navy text-white" : "border-hair bg-white text-ink-soft hover:border-navy hover:text-navy"}`}>
          <span className="truncate" title={group.name}>{group.name}</span><span className="text-xs tabular-nums opacity-80">{group.count}</span>
        </a>)}
      </nav>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-xs text-steel">{current.count ? `Showing ${current.products.length} of ${current.count} products · ${current.name}` : `No equipment listed yet · ${current.name}`}</p>
      <div id="home-equipment-results" className="mt-5">
        {current.products.length > 1 ? <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
          <p className="text-xs font-medium text-navy">Swipe to explore <span className="ml-2 tabular-nums text-steel" aria-live="polite">{slide + 1} / {current.products.length}</span></p>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous product" aria-controls="equipment-product-rail" disabled={slide === 0} onClick={() => moveSlide(slide - 1)} className="flex size-11 items-center justify-center rounded-full border border-hair text-navy disabled:opacity-35"><ArrowLeft size={18} aria-hidden="true" /></button>
            <button type="button" aria-label="Next product" aria-controls="equipment-product-rail" disabled={slide === current.products.length - 1} onClick={() => moveSlide(slide + 1)} className="flex size-11 items-center justify-center rounded-full border border-navy bg-navy text-white disabled:opacity-35"><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div> : null}
        {current.products.length ? <div key={current.slug} id="equipment-product-rail" ref={rail}
          onScroll={event => {
            const el = event.currentTarget;
            if (el.scrollWidth <= el.clientWidth) return;
            const first = el.children[0] as HTMLElement, second = el.children[1] as HTMLElement | undefined;
            if (!second) return;
            setSlide(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 ? current.products.length - 1 :
              Math.min(current.products.length - 1, Math.round(el.scrollLeft / (second.offsetLeft - first.offsetLeft))));
          }}
          className="flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain p-1 pb-3 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-3">
          {current.products.map(product => <Link key={product.slug} href={`/products/${product.slug}`} className={`group flex min-w-0 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-colors hover:border-navy ${current.products.length > 1 ? "w-[86%]" : "w-full"} sm:w-auto`}>
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-hair bg-navy-tint/60 p-3 sm:p-6">
              {product.image ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={publicMediaUrl(product.image)} alt={`${product.name}: product photo`} loading="lazy" decoding="async" className="h-full w-full object-contain" /> :
                <div className="flex flex-col items-center gap-3 text-center text-navy/70"><ImageIcon size={36} strokeWidth={1.2} aria-hidden="true" /><span className="text-xs">Product photo<br />coming soon</span></div>}
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-5">
              <p className="mb-2 break-words text-xs font-medium text-navy-2">{product.brand}</p>
              <h3 className="font-display break-words text-base font-semibold leading-snug text-navy sm:text-xl">{product.name}</h3>
              {product.summary ? <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft sm:text-sm">{product.summary}</p> : null}
              <span className="mt-auto pt-5 text-xs font-semibold text-navy sm:text-sm"><span className="flex min-h-6 items-center justify-between gap-2">View equipment <ArrowUpRight size={17} className="shrink-0" aria-hidden="true" /></span></span>
            </div>
          </Link>)}
        </div> : <div className="rounded-2xl border border-hair bg-paper p-6 sm:p-10">
          <h3 className="font-display text-xl font-semibold text-navy">{current.slug ? "This category is being updated" : "Our catalogue is being updated"}</h3>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">{current.slug ? "There is no equipment listed in this category yet. Try another category or check back later." : "We are adding equipment now. Please check back soon or contact us for help."}</p>
          {current.slug ? <button type="button" onClick={() => setSelected("")} className="btn-outline mt-5 min-h-11">Show all equipment</button> : null}
        </div>}
      </div>
      {current.count ? <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-5">
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">We’ll confirm the model, price and delivery time when you contact us.</p>
        <Link href={catalogueUrl} className="inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-deep">{current.slug ? "View category" : "Browse all equipment"}<ArrowRight size={17} aria-hidden="true" /></Link>
      </div> : null}
    </div>
  </section>;
}
