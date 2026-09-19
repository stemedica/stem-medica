/**
 * Downscale an image in the browser before uploading it.
 *
 * Vercel rejects request bodies over ~4.5 MB with FUNCTION_PAYLOAD_TOO_LARGE
 * before the function runs, so a large photo can never reach the server as-is.
 * Shrinking here is what makes a 10 MB pick work at all.
 *
 * It also saves the admin's upload bandwidth, which matters on Ethiopian mobile
 * data, and keeps the serverless function small and fast.
 *
 * The server still re-encodes with sharp. This is a convenience and a transport
 * fix, not the validation: a client can always send whatever it likes.
 */
export const CLIENT_MAX_EDGE = 1600;
export const CLIENT_QUALITY = 0.82;
/** Comfortably under Vercel's ~4.5 MB body limit, leaving room for overhead. */
export const UPLOAD_BODY_LIMIT = 4_000_000;

export async function downscaleForUpload(file: File): Promise<Blob> {
  // Anything already small enough goes untouched; re-encoding would only lose data.
  if (file.size <= 600_000) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // Unsupported here: let the server decide and report.
  }

  try {
    const scale = Math.min(1, CLIENT_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", CLIENT_QUALITY),
    );
    // Keep whichever is smaller, so this can never make an upload worse.
    return blob && blob.size < file.size ? blob : file;
  } finally {
    bitmap.close();
  }
}
