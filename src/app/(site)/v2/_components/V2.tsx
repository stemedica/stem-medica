import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { ReactNode } from "react";

/* Components scoped to the v2 comparison so restyling here cannot affect v1. */

export function V2Button({
  children,
  variant = "solid",
  badge = false,
}: {
  children: ReactNode;
  variant?: "solid" | "glass" | "outline";
  badge?: boolean;
}) {
  return (
    <span
      role="button"
      aria-disabled="true"
      className={`v2-btn demo-inert select-none ${badge ? "v2-btn-badge" : "v2-btn-plain"} v2-btn-${variant}`}
    >
      {children}
      {badge ? (
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            variant === "solid" ? "bg-white text-scarlet" : "bg-white text-ink"
          }`}
        >
          <ArrowUpRight size={17} />
        </span>
      ) : null}
    </span>
  );
}

export function V2Pill({
  children,
  tone = "glass",
}: {
  children: ReactNode;
  tone?: "glass" | "tint";
}) {
  return <span className={`v2-pill v2-pill-${tone}`}>{children}</span>;
}

/** Photo slot. The whole layout hangs off imagery, so this is deliberately plain. */
export function V2Photo({
  label,
  className = "",
  rounded = true,
}: {
  label: string;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`relative flex items-center justify-center overflow-hidden border border-dashed border-white/25 bg-navy-deep ${
        rounded ? "rounded-[36px]" : ""
      } ${className}`}
    >
      <svg className="absolute inset-0 h-full w-full text-white/10" preserveAspectRatio="none"
           viewBox="0 0 100 100" aria-hidden="true">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative flex flex-col items-center gap-2.5 px-6 text-center">
        <ImageIcon size={24} className="text-white/35" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase leading-relaxed tracking-[.16em] text-white/45">
          {label}
        </span>
      </div>
    </div>
  );
}

export function V2Head({
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const dark = tone === "dark";
  return (
    <header className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <span className={`label font-medium ${dark ? "text-white/55" : "text-steel"}`}>{eyebrow}</span>
      ) : null}
      <h2
        className={`font-display wdth-n mt-4 text-[2.1rem] font-semibold leading-[1.06] tracking-[-0.025em] text-balance sm:text-[2.9rem] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-5 text-[17px] leading-relaxed ${align === "center" ? "" : "max-w-[56ch]"} ${
            dark ? "text-white/65" : "text-ink-soft"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
