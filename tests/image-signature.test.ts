import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeImage } from "../src/lib/image-signature";

const pad = (head: Buffer) => Buffer.concat([head, Buffer.alloc(32)]);

test("recognises the formats we accept", () => {
  assert.ok(looksLikeImage(pad(Buffer.from([0xff, 0xd8, 0xff]))), "jpeg");
  assert.ok(looksLikeImage(pad(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))), "png");
  assert.ok(looksLikeImage(pad(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")]))), "webp");
  assert.ok(looksLikeImage(pad(Buffer.from([0x49, 0x49, 0x2a, 0x00]))), "tiff LE");
  assert.ok(looksLikeImage(pad(Buffer.from([0x4d, 0x4d, 0x00, 0x2a]))), "tiff BE");
  assert.ok(looksLikeImage(pad(Buffer.from("GIF89a"))), "gif");
  assert.ok(looksLikeImage(pad(Buffer.concat([Buffer.alloc(4), Buffer.from("ftyp"), Buffer.from("heic")]))), "heic");
});

test("refuses markup, archives and truncated input", () => {
  assert.equal(looksLikeImage(pad(Buffer.from("<svg xmlns=..."))), false, "svg must not pass");
  assert.equal(looksLikeImage(pad(Buffer.from("<?xml version="))), false, "xml must not pass");
  assert.equal(looksLikeImage(pad(Buffer.from([0x50, 0x4b, 0x03, 0x04]))), false, "zip must not pass");
  assert.equal(looksLikeImage(Buffer.from([0xff, 0xd8])), false, "too short to judge");
  // An ISO box that is not a still image brand.
  assert.equal(looksLikeImage(pad(Buffer.concat([Buffer.alloc(4), Buffer.from("ftyp"), Buffer.from("mp42")]))), false, "mp4 must not pass");
});
