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
    pipeline = sharp(input, { failOn: "error" });
    meta = await pipeline.metadata();
  } catch {
    throw new UnsupportedImage("That file isn’t a readable JPEG, PNG or WebP image.");
  }

  if (!meta.width || !meta.height) throw new UnsupportedImage("That image has no readable dimensions.");
  if (!["jpeg", "png", "webp"].includes(meta.format ?? "")) {
    throw new UnsupportedImage("Upload a JPEG, PNG or WebP image.");
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
