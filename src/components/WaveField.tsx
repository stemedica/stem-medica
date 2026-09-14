/**
 * Ambient background for dark sections.
 *
 * A drifting field of ECG baselines rather than a grid, an orb or a gradient
 * wash. It uses the subject's own material, kept at low contrast so it never competes
 * with type. Purely decorative: pointer-events off, aria-hidden, and it holds
 * still under prefers-reduced-motion.
 */
const LINES = [
  { y: 40, o: 0.1, w: 1.4, d: "0s", s: "38s" },
  { y: 120, o: 0.16, w: 1.6, d: "-6s", s: "30s" },
  { y: 210, o: 0.08, w: 1.2, d: "-14s", s: "46s" },
  { y: 300, o: 0.13, w: 1.5, d: "-3s", s: "34s" },
  { y: 380, o: 0.07, w: 1.2, d: "-20s", s: "52s" },
];

/** One ECG period, repeated across the width. */
function trace(y: number) {
  const seg = (x: number) =>
    `M${x} ${y} h58 l9 0 6 -17 8 30 6 -24 8 11 h55`;
  return [0, 150, 300, 450, 600, 750, 900, 1050].map(seg).join(" ");
}

export function WaveField({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="wave-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="38%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="wave-mask">
            <rect width="1200" height="420" fill="url(#wave-fade)" />
          </mask>
        </defs>

        <g mask="url(#wave-mask)">
          {LINES.map((l) => (
            <g key={l.y} className="wave-drift" style={{ animationDelay: l.d, animationDuration: l.s }}>
              <path
                d={trace(l.y)}
                stroke="var(--color-on-navy)"
                strokeOpacity={l.o}
                strokeWidth={l.w}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
