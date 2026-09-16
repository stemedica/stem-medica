"use client";

import { Children, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Native touch scrolling on phones; regular, fully visible grids on larger screens. */
export function MobileCardRail({ children, label, columns = 3 }: { children: ReactNode; label: string; columns?: 2 | 3 }) {
  const items = Children.toArray(children);
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  function move(index: number) {
    const el = rail.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - (el.firstElementChild as HTMLElement).offsetLeft,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  if (!items.length) return null;
  return <div role="group" aria-label={label} className="min-w-0">
    {items.length > 1 ? <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
      <p className="text-xs font-medium text-navy">Swipe to explore <span className="ml-2 tabular-nums text-steel" aria-live="polite" aria-atomic="true">{position + 1} / {items.length}</span></p>
      <div className="flex gap-2">
        <button type="button" aria-label={`Previous in ${label}`} aria-controls={id} disabled={position === 0} onClick={() => move(position - 1)} className="flex size-11 items-center justify-center rounded-full border border-hair text-navy hover:bg-navy-tint disabled:opacity-35"><ArrowLeft size={18} aria-hidden="true" /></button>
        <button type="button" aria-label={`Next in ${label}`} aria-controls={id} disabled={position >= items.length - 1} onClick={() => move(position + 1)} className="flex size-11 items-center justify-center rounded-full border border-navy bg-navy text-white hover:bg-navy-deep disabled:opacity-35"><ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </div> : null}
    <div id={id} ref={rail} data-card-rail onScroll={event => {
      const el = event.currentTarget;
      const first = el.children[0] as HTMLElement, second = el.children[1] as HTMLElement | undefined;
      if (!second || el.scrollWidth <= el.clientWidth) return;
      setPosition(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 ? items.length - 1 :
        Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / (second.offsetLeft - first.offsetLeft)))));
    }} className={`flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain p-1 pb-3 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map((child, index) => <div key={index} className={`flex min-w-0 shrink-0 snap-start flex-col [&>*]:h-full ${items.length > 1 ? "w-[86%]" : "w-full"} sm:w-auto`}>{child}</div>)}
    </div>
  </div>;
}
