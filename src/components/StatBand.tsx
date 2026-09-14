/** Figures are LOREM placeholder. STEM MEDICA has not supplied real ones. */
const stats = [
  { k: "Lorem ipsum", v: "00", n: "Dolor sit amet" },
  { k: "Consectetur", v: "00", n: "Adipiscing elit" },
  { k: "Sed eiusmod", v: "00%", n: "Tempor incididunt" },
  { k: "Ut labore", v: "Lorem", n: "Dolore magna" },
];

/** Reads as a rating plate riveted to the machine, not a stat card row. */
export function StatBand() {
  return (
    <dl className="grid divide-y divide-white/12 border border-white/15 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.k}
          className={`px-5 py-5 ${i > 0 ? "lg:border-l lg:border-white/12" : ""} ${
            i === 1 || i === 3 ? "sm:border-l sm:border-white/12" : ""
          } ${i > 1 ? "sm:border-t sm:border-white/12 lg:border-t-0" : ""}`}
        >
          <dt className="label text-on-navy/45">{s.k}</dt>
          <dd className="stamp mt-2.5 text-[2rem] text-white">{s.v}</dd>
          <dd className="mt-1.5 font-mono text-[11px] text-scarlet-lift">{s.n}</dd>
        </div>
      ))}
    </dl>
  );
}
