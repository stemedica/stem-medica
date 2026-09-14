import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

/**
 * Uses the real logo from /public when present, and falls back to the drawn mark
 * otherwise so the header never renders a broken image.
 *
 * The supplied file is a 200×200 JPEG on a white ground, so on the navy header
 * and footer it is mounted in a white plate rather than composited directly.
 * A transparent SVG or PNG would remove the need for that plate. See
 * docs/brand-direction.html §05.
 */
const CANDIDATES = [
  "logo.svg", "stem-medica.svg",
  "logo.png", "stem-medica.png",
  "logo.jpg", "stem-medica.jpg", "stem-medica.jpeg",
] as const;

function findLogo(): { src: string; vector: boolean; opaque: boolean } | null {
  const dir = path.join(process.cwd(), "public");
  for (const file of CANDIDATES) {
    if (fs.existsSync(path.join(dir, file))) {
      return {
        src: `/${file}`,
        vector: file.endsWith(".svg"),
        opaque: file.endsWith(".jpg") || file.endsWith(".jpeg"),
      };
    }
  }
  return null;
}

/** Reduced mark: a broken blue orbit around a solid red centre. */
export function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <circle
        cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="4.5"
        strokeDasharray="34 13" transform="rotate(-58 20 20)"
      />
      <circle cx="20" cy="20" r="6.5" fill="var(--color-scarlet)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display wdth-xw font-bold uppercase leading-none tracking-tight ${className}`}>
      Stem<span className="text-scarlet">&nbsp;Medica</span>
    </span>
  );
}

export function Logo({
  height = 40,
  onDark = false,
  className = "",
}: {
  height?: number;
  onDark?: boolean;
  className?: string;
}) {
  const logo = findLogo();

  if (!logo) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <Mark size={height - 10} />
        <Wordmark className="text-[17px]" />
      </span>
    );
  }

  const img = (
    <Image
      src={logo.src}
      alt="STEM MEDICA"
      width={height * 2}
      height={height * 2}
      priority
      unoptimized={logo.vector}
      className="w-auto object-contain"
      style={{ height }}
    />
  );

  // An opaque file on a dark ground gets a white plate so the JPEG's own
  // background reads as a deliberate badge rather than a rectangle artefact.
  if (onDark && logo.opaque) {
    return (
      <span className={`inline-flex items-center bg-white px-2 py-1.5 ${className}`} style={{ borderRadius: 2 }}>
        {img}
      </span>
    );
  }
  return <span className={`inline-flex items-center ${className}`}>{img}</span>;
}
