/**
 * Byte-signature check for uploads.
 *
 * The server never decodes image data. Image parsers (libvips, libheif,
 * libpng) are a recurring source of memory-safety CVEs, and running them over
 * bytes a stranger uploaded is the highest-risk thing this app could do. So the
 * server inspects the header, stores the bytes, and never interprets them.
 *
 * The consequence is that only formats the *browser* can decode are accepted:
 * the browser does all resizing and re-encoding, so anything it cannot read
 * could not be normalised by anyone. That rules out HEIC and TIFF.
 *
 * SVG is excluded separately and permanently: it is markup that can carry
 * script, not a photograph.
 */
export type ImageKind = { ext: "jpg" | "png" | "webp"; contentType: string };

export function imageKind(bytes: Buffer): ImageKind | null {
  if (bytes.length < 16) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", contentType: "image/jpeg" };
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { ext: "png", contentType: "image/png" };
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", contentType: "image/webp" };
  return null;
}
