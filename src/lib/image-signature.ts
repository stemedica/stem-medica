/**
 * Cheap magic-byte gate in front of the native decoder.
 *
 * Not validation: processImage re-encoding the file is. This only avoids
 * handing obvious non-images to sharp. SVG is intentionally not recognised,
 * because it is markup that can carry script rather than a photograph.
 */
const HEIF_BRANDS = ["heic", "heix", "hevc", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];

export function looksLikeImage(bytes: Buffer): boolean {
  if (bytes.length < 16) return false;

  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  // PNG
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return true;
  // WebP: RIFF container with a WEBP fourcc
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return true;
  // TIFF, little and big endian
  if (bytes.toString("hex", 0, 4) === "49492a00" || bytes.toString("hex", 0, 4) === "4d4d002a") return true;
  // GIF
  if (bytes.toString("ascii", 0, 4) === "GIF8") return true;
  // HEIC/HEIF: ISO base media box, brand in bytes 8..12
  if (bytes.toString("ascii", 4, 8) === "ftyp" && HEIF_BRANDS.includes(bytes.toString("ascii", 8, 12))) return true;

  return false;
}
