"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * One row that scrolls sideways at every width.
 *
 * Cards are sized so the next one is always part-visible at the right edge:
 * a cropped card is what tells you the row continues. The arrows float over
 * that edge and fade up on hover, but they are ordinary buttons — they stay
 * in the tab order and appear on focus, so the row is not mouse-only.
 */
export function ScrollRail({ children, label, size = "wide" }: {
  children: ReactNode;
  label: string;
  /** "single" shows one at a time, "feature" two, "wide" three, "narrow" four. */
  size?: "single" | "feature" | "wide" | "narrow";
}) {
  const items = Children.toArray(children);
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [position, setPosition] = useState(0);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2,
    });
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    if (!first || !second) return;
    const step = second.offsetLeft - first.offsetLeft;
    setPosition(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2
      ? el.children.length - 1
      : Math.min(el.children.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }, []);

  useEffect(() => {
    measure();
    const el = rail.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, items.length]);

  function page(direction: 1 | -1) {
    const el = rail.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    el.scrollBy({
      left: direction * (first.offsetWidth + 16),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  if (!items.length) return null;

  const single = size === "single";
  const width = {
    // One at a time, with a sliver of the next: without the peek nothing on
    // screen says the row continues, and the counter alone is easy to miss.
    single: "w-[92%] sm:w-[88%] lg:w-[84%]",
    // Half-width cards read as stories; thirds read as tiles. Each keeps the
    // next card part-visible, which is what says the row continues.
    feature: "w-[86%] sm:w-[70%] lg:w-[47.5%]",
    wide: "w-[82%] sm:w-[54%] lg:w-[31.5%]",
    narrow: "w-[78%] sm:w-[44%] lg:w-[30%] xl:w-[23.5%]",
  }[size];
  const arrow = "pointer-events-auto flex size-12 items-center justify-center rounded-full border border-hair bg-white text-navy shadow-[0_6px_20px_rgba(15,37,85,.16)] transition-[opacity,transform,background-color] duration-300 hover:bg-navy hover:text-white disabled:pointer-events-none disabled:opacity-0 focus-visible:opacity-100 group-hover/rail:opacity-100 sm:opacity-0";

  return (
    <div className="group/rail relative min-w-0">
      {single && items.length > 1 ? (
        <p className="mb-4 flex items-center gap-3 text-sm font-medium text-steel">
          <span aria-live="polite" aria-atomic="true" className="tabular-nums">{position + 1} of {items.length}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-hair" />
        </p>
      ) : null}
      <div
        id={id}
        ref={rail}
        role="group"
        aria-label={label}
        tabIndex={0}
        onScroll={measure}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2"
      >
        {items.map((child, index) => (
          <div key={index} className={`flex shrink-0 snap-start flex-col ${width} [&>*]:h-full`}>{child}</div>
        ))}
      </div>

      <div aria-hidden={false} className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-1 sm:flex">
        <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label={`Scroll ${label} backwards`} aria-controls={id} className={`${arrow} -translate-x-1/2`}>
          <ArrowLeft size={19} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label={`Scroll ${label} forwards`} aria-controls={id} className={`${arrow} translate-x-1/2`}>
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
