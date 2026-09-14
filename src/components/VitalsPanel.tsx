/**
 * Hero graphic: a patient-monitor vitals readout.
 *
 * Chosen over a stock photo or an abstract shape because it is the subject's
 * own material and needs no photography to look finished. The figures are
 * simulated and labelled as such, so nothing reads as live clinical data.
 */
const VITALS = [
  { label: "HR", value: "72", unit: "bpm", accent: true },
  { label: "SpO₂", value: "98", unit: "%" },
  { label: "NIBP", value: "118/76", unit: "mmHg" },
  { label: "Temp", value: "36.8", unit: "°C" },
];

export function VitalsPanel() {
  return (
    <figure className="ticks relative m-0 border border-white/20 bg-navy-deep/70 p-1.5 shadow-deep backdrop-blur-sm">
      <div className="border border-white/10 bg-[#0A1730]/80">
        {/* Screen header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="label text-on-navy/45">Bed 04 · ICU</span>
          <span className="label flex items-center gap-1.5 text-on-navy/45">
            <span className="pulse-dot h-1.5 w-1.5 bg-scarlet" />
            Simulated
          </span>
        </div>

        {/* Traces */}
        <div className="px-4 pt-4">
          <svg viewBox="0 0 600 150" className="h-28 w-full sm:h-36" fill="none" aria-hidden="true">
            {/* Each trace is drawn twice: a base that is always fully visible so
                the panel reads as "on" at rest, and a brighter segment that
                sweeps along it. */}
            {[
              {
                d: "M0 46 H92 l12 0 8 -26 10 46 8 -38 9 18 H300 l12 0 8 -26 10 46 8 -38 9 18 H600",
                stroke: "var(--color-scarlet)", base: 0.42, w: 2, dur: "3.4s",
              },
              {
                d: "M0 104 c26 0 30 -30 56 -30 t56 30 H240 c26 0 30 -30 56 -30 t56 30 H480 c26 0 30 -30 56 -30 t56 30 H600",
                stroke: "var(--color-on-navy)", base: 0.18, w: 1.6, dur: "5.2s",
              },
            ].map((t) => (
              <g key={t.d}>
                <path d={t.d} stroke={t.stroke} strokeOpacity={t.base} strokeWidth={t.w}
                      strokeLinecap="round" strokeLinejoin="round" />
                <path d={t.d} stroke={t.stroke} strokeWidth={t.w}
                      strokeLinecap="round" strokeLinejoin="round"
                      pathLength={1} className="trace-head" style={{ animationDuration: t.dur }} />
              </g>
            ))}
          </svg>
        </div>

        {/* Readout */}
        <dl className="grid grid-cols-2 border-t border-white/10 xl:grid-cols-4">
          {VITALS.map((v, i) => (
            <div
              key={v.label}
              className={`px-4 py-4 ${i % 2 === 1 ? "border-l border-white/10" : ""} ${
                i > 1 ? "border-t border-white/10 xl:border-t-0" : ""
              } xl:border-l xl:first:border-l-0`}
            >
              <dt className="label text-on-navy/40">{v.label}</dt>
              <dd
                className={`stamp mt-2 whitespace-nowrap text-xl tabular-nums lg:text-2xl ${
                  v.accent ? "text-scarlet-lift" : "text-white"
                }`}
              >
                {v.value}
                <span className="ml-1 font-mono text-[10px] font-normal tracking-widest text-on-navy/35">
                  {v.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="sr-only">
        Simulated patient monitor readout used as a decorative hero graphic.
      </figcaption>
    </figure>
  );
}
