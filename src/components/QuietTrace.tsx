/**
 * A single ECG baseline for light surfaces, drawn as the section is reached.
 *
 * The site already carries this line: the hero ribbons, the dark WaveField,
 * the pulse running through the support band. This is the same material at a
 * whisper, for the white sections where a block of type leaves the rest of the
 * width empty.
 *
 * Decorative only — aria-hidden, pointer-events off, and it holds still under
 * prefers-reduced-motion. It occupies space nothing else wanted rather than
 * competing with anything.
 */
export function QuietTrace({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none" className="h-full w-full text-navy/15">
        <path
          className="supply-trace"
          d="M0 30 H240 l10 0 7 -17 9 32 7 -25 9 10 H660 l10 0 7 -17 9 32 7 -25 9 10 H1200"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
