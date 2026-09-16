import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

/**
 * Renders the real logo from /public, falling back to the drawn mark if no
 * artwork is present so the header never shows a broken image.
 *
 * public/logo.png is a transparent, tight-cropped lockup generated from the
 * supplied JPEG by scripts/extract-emblem.py, so it needs no mounting plate and
 * sits on any light ground. The JPEG stays as the source for that script.
 */
const CANDIDATES = [
  "logo.svg", "stem-medica.svg",
  "logo.png", "stem-medica.png",
  "logo.jpg", "stem-medica.jpg", "stem-medica.jpeg",
] as const;

type Found = { src: string; w: number; h: number; vector: boolean };

/** PNG intrinsic size lives in the IHDR chunk: width/height at bytes 16..24. */
function pngSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function findLogo(): Found | null {
  const dir = path.join(process.cwd(), "public");
  for (const file of CANDIDATES) {
    const full = path.join(dir, file);
    if (!fs.existsSync(full)) continue;

    const vector = file.endsWith(".svg");
    const size = file.endsWith(".png") ? pngSize(fs.readFileSync(full)) : null;

    return {
      src: `/${file}`,
      w: size?.w ?? 200,
      h: size?.h ?? 200,
      vector,
    };
  }
  return null;
}

// Deployment assets are immutable; avoid synchronous disk reads on every render.
const discoveredLogo = findLogo();

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
  height = 38,
  onDark = false,
  className = "",
}: {
  height?: number;
  onDark?: boolean;
  className?: string;
}) {
  const logo = discoveredLogo;

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
      width={logo.w}
      height={logo.h}
      sizes={`${Math.ceil(height * logo.w / logo.h)}px`}
      preload
      unoptimized={logo.vector}
      className="w-auto"
      style={{ height }}
    />
  );

  // The artwork's own "STEM" is navy ink, so on a dark ground it needs a light
  // plate whether or not the file has an alpha channel. Transparency still helps:
  // the plate now hugs the ink instead of framing a JPEG rectangle.
  if (onDark) {
    return (
      <span
        className={`inline-flex items-center bg-white px-2 py-1.5 ${className}`}
        style={{ borderRadius: 2 }}
      >
        {img}
      </span>
    );
  }
  return <span className={`inline-flex items-center ${className}`}>{img}</span>;
}
