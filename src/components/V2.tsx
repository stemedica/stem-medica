import Link from "next/link";
import { publicMediaUrl } from "@/lib/preview-paths";
import { ArrowUpRight, ImageIcon, Play } from "lucide-react";
import type { ReactNode } from "react";

/* The site design system. Pass `href` to navigate; omit it for an inert display button. */

export function V2Button({
  children,
  variant = "solid",
  badge = false,
  href,
}: {
  children: ReactNode;
  variant?: "solid" | "glass" | "outline";
  badge?: boolean;
  /** Omit to render inert, for display-only mockups. */
  href?: string;
}) {
  const cls = `v2-btn ${badge ? "v2-btn-badge" : "v2-btn-plain"} v2-btn-${variant}`;
  const inner = (
    <>
      {children}
      {badge ? (
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover/btn:rotate-45 ${
            variant === "solid" ? "bg-white text-scarlet" : "bg-white text-ink"
          }`}
        >
          <ArrowUpRight size={17} />
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <span role="button" aria-disabled="true" className={`${cls} demo-inert select-none`}>
        {inner}
      </span>
    );
  }
  if (href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={`${cls} group/btn`}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return <Link href={href} className={`${cls} group/btn`}>{inner}</Link>;
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
  src,
  label,
  className = "",
  rounded = true,
  kind = "photo",
  fill = false,
}: {
  src?: string;
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
  if (src) {
    // Images are uploaded through the CMS and served by the published-media route.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={publicMediaUrl(src)} alt={label} loading="lazy" className={`${fill ? "absolute inset-0 h-full w-full" : "block"} object-cover object-center ${rounded ? "rounded-[36px]" : ""} ${className}`} />;
  }
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
        <span className="max-w-[34ch] text-sm font-medium leading-relaxed text-white/75">
          {label}
        </span>
        {isVideo ? (
          <span className="text-xs text-white/65">
            Video preview · muted and looping
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function V2Head({
  title,
  lede,
  tone = "light",
  align = "left",
}: {
  title: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const dark = tone === "dark";
  return (
    <header className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      <h2
        className={`font-display wdth-n text-[1.8rem] font-semibold leading-[1.1] tracking-[-0.022em] text-balance sm:text-[2.3rem] ${
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
