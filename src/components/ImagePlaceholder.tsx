import { ImageIcon } from "lucide-react";

/**
 * Conventional image placeholder: deliberately plain grey with a diagonal
 * cross, so an empty photo slot is never mistaken for finished artwork.
 *
 * Each instance names the photograph that belongs there, which doubles as the
 * shot list for STEM MEDICA. Replace with <Image> as the real photography lands.
 */
export function ImagePlaceholder({
  src,
  label,
  ratio = "16/10",
  tone = "light",
  className = "",
}: {
  src?: string;
  label: string;
  ratio?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={label} loading="lazy" className={`w-full object-contain ${className}`} style={{ aspectRatio: ratio }} />;
  }
  const dark = tone === "dark";
  const c = dark
    ? { edge: "border-white/25", fill: "bg-white/[.04]", cross: "text-white/12", icon: "text-white/40", text: "text-white/55", sub: "text-white/30" }
    : { edge: "border-steel/40", fill: "bg-steel/8", cross: "text-steel/25", icon: "text-steel/60", text: "text-steel/75", sub: "text-steel/45" };

  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`relative flex items-center justify-center overflow-hidden border border-dashed ${c.edge} ${c.fill} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* Classic crossed-box marks. */}
      <svg
        className={`pointer-events-none absolute inset-0 h-full w-full ${c.cross}`}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <ImageIcon size={22} className={c.icon} aria-hidden="true" />
        <span className={`font-mono text-[10px] uppercase leading-relaxed tracking-[.16em] ${c.text}`}>
          {label}
        </span>
        <span className={`font-mono text-[9px] tracking-[.14em] ${c.sub}`}>
          {ratio.replace("/", ":")} · Placeholder
        </span>
      </div>
    </div>
  );
}
