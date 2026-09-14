import type { ReactNode } from "react";
import { WaveField } from "./WaveField";

/**
 * Asset tag: the way a real device is labelled on its nameplate.
 * Deliberately squared, two-cell, and never a pill with a dot in it.
 */
export function Tag({
  index,
  children,
  tone = "light",
}: {
  index: string;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span className={`tag font-medium ${tone === "dark" ? "text-on-navy/45" : "text-steel"}`}>
      <span className="tag-key">{index}</span>
      <span className={tone === "dark" ? "text-on-navy/80" : "text-ink"}>{children}</span>
    </span>
  );
}

/** Section header: a 2px rule with a mono label, not a centred pill stack. */
export function SectionHead({
  index,
  label,
  title,
  lede,
  meta,
  tone = "light",
}: {
  index: string;
  label: string;
  title?: ReactNode;
  lede?: ReactNode;
  meta?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <header>
      <div className={`rule-head pt-3 ${dark ? "text-on-navy/35" : "text-ink"}`}>
        <div className={`label flex items-baseline justify-between gap-4 ${dark ? "text-on-navy/50" : "text-steel"}`}>
          <span className="flex items-baseline gap-3">
            <span className="text-scarlet">{index}</span>
            <span className={dark ? "text-on-navy" : "text-ink"}>{label}</span>
          </span>
          {meta ? <span className="tabular-nums">{meta}</span> : null}
        </div>
      </div>
      {title ? (
        <h2 className="font-display wdth-w mt-5 max-w-[20ch] text-[2rem] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-balance sm:text-[2.6rem]">
          {title}
        </h2>
      ) : null}
      {lede ? (
        <p className={`mt-4 max-w-[58ch] text-[17px] leading-relaxed ${dark ? "text-on-navy/70" : "text-ink-soft"}`}>
          {lede}
        </p>
      ) : null}
    </header>
  );
}

export function Section({
  index,
  label,
  title,
  lede,
  meta,
  children,
  tone = "light",
  className = "",
}: {
  index: string;
  label: string;
  title?: ReactNode;
  lede?: ReactNode;
  meta?: string;
  children?: ReactNode;
  tone?: "light" | "dark" | "tint";
  className?: string;
}) {
  const dark = tone === "dark";
  const ground = dark ? "bg-navy-deep text-on-navy" : tone === "tint" ? "bg-navy-tint/40" : "";

  return (
    <section className={`relative ${ground} ${className}`}>
      {dark ? <WaveField /> : null}
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHead
          index={index}
          label={label}
          title={title}
          lede={lede}
          meta={meta}
          tone={dark ? "dark" : "light"}
        />
        {children}
      </div>
    </section>
  );
}

/** Secondary brand device: a single ECG complex used as a section divider. */
export function EcgRule() {
  return (
    <div className="bg-navy-deep">
      <svg className="block h-9 w-full text-scarlet" viewBox="0 0 1200 34"
           preserveAspectRatio="none" aria-hidden="true">
        <path
          className="ecg-trace"
          d="M0 22 H150 l10 0 6 -14 7 24 6 -20 7 10 H420 l10 0 6 -14 7 24 6 -20 7 10 H690 l10 0 6 -14 7 24 6 -20 7 10 H960 l10 0 6 -14 7 24 6 -20 7 10 H1200"
          fill="none" stroke="currentColor" strokeWidth="1.6"
          vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
