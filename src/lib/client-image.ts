/**
 * Downscale an image in the browser before uploading it.
 *
 * Vercel rejects request bodies over ~4.5 MB with FUNCTION_PAYLOAD_TOO_LARGE
 * before the function runs, so a large photo can never reach the server as-is.
 * Shrinking here is what makes a 10 MB pick work at all. It also saves the
 * editor's upload bandwidth, the scarce resource on mobile data.
 *
 * This is also the ONLY place images are resized. The server never decodes
 * uploaded bytes, so anything the browser cannot read cannot be normalised by
 * anyone, which is why only JPEG, PNG and WebP are accepted.
 */
import { UserFacingError } from "./form-errors";

export const CLIENT_MAX_EDGE = 2048;
export const CLIENT_QUALITY = 0.92;
/** Comfortably under Vercel's ~4.5 MB body limit, leaving room for overhead. */
export const UPLOAD_BODY_LIMIT = 4_000_000;

/**
 * Raised when nothing we can do will get the file under the wire limit.
 * Extends UserFacingError so the editors show this message rather than the
 * generic "please try again" fallback: the wording tells the user what to do.
 */
export class ImageTooLargeToSend extends UserFacingError {}

type Source = { draw: CanvasImageSource; width: number; height: number; release: () => void };

/**
 * Decode paths tried in order:
 * 1. createImageBitmap with imageOrientation "from-image" to respect EXIF rotation on mobile shots.
 * 2. createImageBitmap with no options, for older engines.
 * 3. HTMLImageElement via object URL fallback.
 */
async function decode(file: File): Promise<Source | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { draw: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        return { draw: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
      } catch {
        /* try the next path */
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const element = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
    return {
      draw: element,
      width: element.naturalWidth,
      height: element.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

function render(source: Source, edge: number, quality: number) {
  const maxEdge = Math.max(source.width, source.height);
  const scale = Math.min(1, edge / maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source.draw, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

export async function downscaleForUpload(file: File): Promise<Blob> {
  // Already small enough: re-encoding would only lose data for no gain.
  if (file.size <= 600_000) return file;

  const source = await decode(file);
  if (!source) {
    // Nothing could read it. Send it on so the server reports why, unless it
    // cannot physically get there.
    if (file.size > UPLOAD_BODY_LIMIT) {
      throw new ImageTooLargeToSend(
        "This browser could not read that image, and the file is too large to upload as-is. Save it as a JPEG and try again.",
      );
    }
    return file;
  }

  try {
    // Step down until it fits. A photograph clears the first pass; this only
    // continues for the rare image that stays stubbornly large.
    for (const [edge, quality] of [
      [CLIENT_MAX_EDGE, CLIENT_QUALITY],
      [1920, 0.90],
      [1600, 0.88],
      [1280, 0.82],
    ] as const) {
      const blob = await render(source, edge, quality);
      if (blob && blob.size <= UPLOAD_BODY_LIMIT) {
        // Never make an upload worse than the original.
        return blob.size < file.size ? blob : file;
      }
    }
  } finally {
    source.release();
  }

  if (file.size > UPLOAD_BODY_LIMIT) {
    throw new ImageTooLargeToSend("That image is too large to upload even after resizing. Try a smaller photo.");
  }
  return file;
}
