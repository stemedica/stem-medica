import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { processImage, UnsupportedImage, MAX_EDGE } from "../src/lib/image-processing";

/** Noise, so the result reflects a photograph rather than a flat fill. */
async function photo(width: number, height: number, format: "jpeg" | "png" | "webp" = "jpeg") {
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 7 + (i % 13) * 31) % 256;
  const image = sharp(pixels, { raw: { width, height, channels: 3 } });
  return format === "jpeg" ? image.jpeg({ quality: 95 }).toBuffer()
    : format === "png" ? image.png().toBuffer()
    : image.webp().toBuffer();
}

test("uploads are resized, re-encoded to WebP and stripped of metadata", async () => {
  const original = await photo(4000, 3000);
  const out = await processImage(original);

  assert.equal(out.ext, "webp");
  assert.equal(out.contentType, "image/webp");

  // The long edge is capped, which is the guaranteed saving regardless of content.
  assert.equal(Math.max(out.width, out.height), MAX_EDGE);
  assert.equal(out.width, 1600);
  assert.equal(out.height, 1200);
  assert.ok(out.bytes.byteLength < original.byteLength, "processed image should be smaller");

  const meta = await sharp(out.bytes).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.exif, undefined, "EXIF, including any GPS tags, must be dropped");
});

test("images already within bounds are not enlarged", async () => {
  const out = await processImage(await photo(800, 600, "png"));
  assert.equal(out.width, 800);
  assert.equal(out.height, 600);
  assert.equal(out.ext, "webp");
});

test("portrait orientation survives metadata stripping", async () => {
  const out = await processImage(await photo(1200, 2400));
  assert.equal(out.height, MAX_EDGE);
  assert.ok(out.height > out.width, "a portrait image must stay portrait");
});

test("unreadable files are rejected rather than stored", async () => {
  await assert.rejects(() => processImage(Buffer.from("this is not an image")), UnsupportedImage);
  const truncated = (await photo(200, 200)).subarray(0, 50);
  await assert.rejects(() => processImage(truncated), UnsupportedImage);
});
