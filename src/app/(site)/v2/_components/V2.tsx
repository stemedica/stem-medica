import { ArrowUpRight, ImageIcon, Play } from "lucide-react";
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

/**
 * Media slot. The whole layout hangs off imagery, so this is deliberately plain.
 * `kind="video"` marks the slots that will carry footage rather than a still.
 */
export function V2Photo({
  label,
  className = "",
  rounded = true,
  kind = "photo",
  fill = false,
}: {
  label: string;
  className?: string;
  rounded?: boolean;
  kind?: "photo" | "video";
  /** Stretch to the positioned parent instead of sitting in flow.
   *  An explicit prop because passing "absolute" via className loses to the
   *  base "relative": Tailwind emits .relative after .absolute, so class order
   *  in the attribute does not decide the winner. */
  fill?: boolean;
}) {
  const isVideo = kind === "video";
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`${fill ? "absolute inset-0 items-start pt-[26%]" : "relative items-center"} flex justify-center overflow-hidden border border-dashed border-white/25 bg-navy-deep ${
        rounded ? "rounded-[36px]" : ""
      } ${className}`}
    >
      <svg className="absolute inset-0 h-full w-full text-white/10" preserveAspectRatio="none"
           viewBox="0 0 100 100" aria-hidden="true">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        {isVideo ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
            <Play size={22} className="ml-0.5 fill-white/70 text-white/70" aria-hidden="true" />
          </span>
        ) : (
          <ImageIcon size={24} className="text-white/35" aria-hidden="true" />
        )}
        <span className="font-mono text-[10px] uppercase leading-relaxed tracking-[.16em] text-white/45">
          {label}
        </span>
        {isVideo ? (
          <span className="font-mono text-[9px] uppercase tracking-[.16em] text-white/30">
            Video · autoplay, muted, looping
          </span>
        ) : null}
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
        className={`font-display wdth-n mt-3 text-[1.8rem] font-semibold leading-[1.1] tracking-[-0.022em] text-balance sm:text-[2.3rem] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-3.5 text-[16px] leading-relaxed ${align === "center" ? "" : "max-w-[56ch]"} ${
            dark ? "text-white/65" : "text-ink-soft"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
