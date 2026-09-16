import test from "node:test";
import assert from "node:assert/strict";
import { publicMediaUrl } from "../src/lib/preview-paths";
test("public media is mounted without modifying stored or already-mounted paths", () => {
  assert.equal(publicMediaUrl("/media/abc.webp"), "/test/media/abc.webp");
  assert.equal(publicMediaUrl("/test/media/abc.webp"), "/test/media/abc.webp");
  assert.equal(publicMediaUrl("/test/admin/api/media?id=abc.webp"), "/test/admin/api/media?id=abc.webp");
  assert.equal(publicMediaUrl("/logo.png"), "/logo.png");
});
