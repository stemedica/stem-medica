import sharp, { type Sharp, type Metadata } from "sharp";

/**
 * Normalise an uploaded image before it is stored.
 *
 * Uploads went into Blob byte-for-byte, so a 3 MB phone photo was stored and
 * served at 3 MB. The audience is largely on Ethiopian mobile data, so this is
 * the single biggest weight on the site.
 *
 * Everything is re-encoded to WebP: one output format keeps the serving route
 * and the schema regexes simple, and it beats JPEG and PNG at this quality.
 * EXIF is dropped, which also removes the GPS coordinates phones attach.
 */
export const MAX_EDGE = 1600;
export const QUALITY = 78;

/**
 * Decode ceiling, ~40 megapixels.
 *
 * A few hundred KB of compressed data can expand to hundreds of megapixels, and
 * decoding that allocates width x height x channels bytes before any resize
 * happens. On a 1 GB serverless function that is an out-of-memory crash from a
 * small upload. 40 MP covers any real camera while keeping the peak allocation
 * near 120 MB.
 */
export const MAX_PIXELS = 40_000_000;

export const ACCEPTED_FORMATS = ["jpeg", "png", "webp", "heif", "tiff", "gif"];

export class UnsupportedImage extends Error {}

export type ProcessedImage = {
  bytes: Buffer;
  ext: "webp";
  contentType: "image/webp";
  width: number;
  height: number;
  originalBytes: number;
};

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  let pipeline: Sharp;
  let meta: Metadata;
  try {
    // `failOn: "error"` rejects truncated or malformed files rather than
    // silently storing something browsers cannot decode.
    pipeline = sharp(input, { failOn: "error", limitInputPixels: MAX_PIXELS });
    meta = await pipeline.metadata();
  } catch {
    throw new UnsupportedImage("That file isn’t a readable JPEG, PNG or WebP image.");
  }

  if (!meta.width || !meta.height) throw new UnsupportedImage("That image has no readable dimensions.");
  if (meta.width * meta.height > MAX_PIXELS) {
    throw new UnsupportedImage("That image is too many megapixels to process. Resize it and try again.");
  }
  // Everything is re-encoded to WebP, so accepting more input formats costs
  // nothing downstream. HEIC matters because iPhones shoot it by default, and
  // TIFF because manufacturers send product shots and scanned datasheets that
  // way. SVG is deliberately absent: it is markup, can carry script, and is an
  // XSS vector rather than a photograph.
  if (!ACCEPTED_FORMATS.includes(meta.format ?? "")) {
    throw new UnsupportedImage("Upload a JPEG, PNG, WebP, HEIC or TIFF image.");
  }

  const bytes = await pipeline
    .rotate() // apply EXIF orientation before it is stripped, or portraits land sideways
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();

  const out = await sharp(bytes).metadata();
  return {
    bytes,
    ext: "webp",
    contentType: "image/webp",
    width: out.width ?? 0,
    height: out.height ?? 0,
    originalBytes: input.byteLength,
  };
}
