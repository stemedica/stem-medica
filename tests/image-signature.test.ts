import { test } from "node:test";
import assert from "node:assert/strict";
import { imageKind } from "../src/lib/image-signature";

const pad = (head: Buffer) => Buffer.concat([head, Buffer.alloc(32)]);

test("identifies the formats browsers can decode", () => {
  assert.deepEqual(imageKind(pad(Buffer.from([0xff, 0xd8, 0xff]))), { ext: "jpg", contentType: "image/jpeg" });
  assert.deepEqual(imageKind(pad(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))), { ext: "png", contentType: "image/png" });
  assert.deepEqual(
    imageKind(pad(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")]))),
    { ext: "webp", contentType: "image/webp" },
  );
});

test("refuses anything the browser could not render, and anything scriptable", () => {
  // SVG is markup that can carry script, never acceptable as an upload.
  assert.equal(imageKind(pad(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">'))), null);
  assert.equal(imageKind(pad(Buffer.from("<?xml version="))), null);
  // Formats the browser cannot decode, so nothing could have normalised them.
  assert.equal(imageKind(pad(Buffer.from([0x49, 0x49, 0x2a, 0x00]))), null, "tiff");
  assert.equal(imageKind(pad(Buffer.concat([Buffer.alloc(4), Buffer.from("ftyp"), Buffer.from("heic")]))), null, "heic");
  // Not images at all.
  assert.equal(imageKind(pad(Buffer.from([0x50, 0x4b, 0x03, 0x04]))), null, "zip");
  assert.equal(imageKind(Buffer.from([0xff, 0xd8])), null, "too short to judge");
});
