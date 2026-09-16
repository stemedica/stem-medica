/** Abstract linework: no video download or equipment imagery. */
export function HeroAnimation() {
  return <>
    <div aria-hidden="true" className="hero-animation pointer-events-none absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none">
        <g className="hero-ribbon hero-ribbon-back" stroke="#5c89cb" strokeWidth="1" opacity=".35">
          {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M-200 ${180 + i * 22} C350 ${-220 + i * 24} 600 ${1050 - i * 14} 1640 ${200 + i * 20}`} />)}
        </g>
        <g className="hero-ribbon hero-ribbon-front" stroke="#91d4db" strokeWidth="1.2" opacity=".5">
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M-160 ${750 + i * 18} C440 ${760 - i * 16} 820 ${-280 + i * 20} 1630 ${140 + i * 28}`} />)}
        </g>
      </svg>
    </div>
  </>;
}
