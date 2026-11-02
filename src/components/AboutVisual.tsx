interface AboutVisualProps {
  className?: string;
  badgeText?: string;
  subText?: string;
  showPill?: boolean;
}

export function AboutVisual({
  className = "",
  badgeText = "Direct Factory Partnerships · Certified Support",
  subText = "Addis Ababa · Nationwide Distribution",
  showPill = true,
}: AboutVisualProps) {
  return (
    <div
      aria-label="STEM MEDICA brand emblem"
      className={`relative flex w-full flex-col items-center justify-center overflow-visible select-none group/visual ${
        showPill ? "py-6 sm:py-10" : "py-8 sm:py-14"
      } ${className}`}
    >
      {/* Origin Header Tag - Clean, minimal typography */}
      <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider text-steel transition-colors group-hover/visual:text-navy">
        <span className="h-2 w-2 rounded-full bg-scarlet" aria-hidden="true" />
        <span className="font-mono text-[11px] font-semibold tracking-wider text-navy/85">EST. 2023 G.C.</span>
        <span aria-hidden="true" className="text-hair">·</span>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-steel">
          Biomedical Engineering & Distribution
        </span>
      </div>

      {/* Hero Centerpiece: Pure, high-resolution vector emblem (Unboxed, frameless) */}
      <div className="relative my-6 sm:my-8 flex flex-col items-center justify-center p-2 transition-transform duration-500 ease-out group-hover/visual:scale-[1.03]">
        <picture>
          <source srcSet="/logo.svg" type="image/svg+xml" />
          <source srcSet="/logo.webp" type="image/webp" />
          <img
            src="/logo.png"
            alt="STEM MEDICA - Putting quality in the front line"
            width={340}
            height={216}
            fetchPriority="high"
            decoding="async"
            className="w-[260px] xs:w-[300px] sm:w-[340px] lg:w-[380px] h-auto object-contain drop-shadow-[0_16px_36px_rgba(15,37,85,0.08)] drop-shadow-[0_4px_12px_rgba(196,55,46,0.05)] transition-all duration-500 group-hover/visual:drop-shadow-[0_22px_44px_rgba(15,37,85,0.14)]"
          />
        </picture>

        {/* Soft Grounding Shadow beneath logo */}
        <div
          aria-hidden="true"
          className="mt-2 h-2.5 w-36 sm:w-48 rounded-full bg-navy/[0.06] blur-xs transition-all duration-500 group-hover/visual:scale-110 group-hover/visual:opacity-75"
        />
      </div>

      {/* Optional Status Pill (Only on pages requesting it; omitted on About page per request) */}
      {showPill && (
        <div className="flex flex-col items-center gap-1.5 text-center transition-all duration-300">
          <div className="inline-flex items-center gap-2 rounded-full border border-navy/12 bg-white/90 px-4 py-1.5 text-[11.5px] sm:text-xs font-semibold text-navy shadow-[0_2px_12px_rgba(15,37,85,0.04)] backdrop-blur-xs transition-all duration-300 group-hover/visual:border-scarlet/35 group-hover/visual:shadow-[0_4px_18px_rgba(15,37,85,0.08)]">
            <span className="h-2 w-2 rounded-full bg-scarlet" aria-hidden="true" />
            <span>{badgeText}</span>
          </div>

          {subText && (
            <span className="font-mono text-[10.5px] sm:text-[11px] font-medium tracking-wide text-steel">
              {subText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
