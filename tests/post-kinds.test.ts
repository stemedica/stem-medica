import test from "node:test";
import assert from "node:assert/strict";
import { postKinds, postSchema } from "../src/lib/post-schema";

test("blog and truthful arrival types are offered; old order posts retain their content", () => {
  assert.deepEqual(postKinds, ["Blog", "Upcoming arrival", "New arrival"]);
  const old = { id: "01994ddd-1000-4000-8000-000000000003", slug: "existing-order-story", title: "Existing story", date: "2026-09-16", kind: "Order update", body: "Keep this article.", image: "", published: true };
  const result = postSchema.parse(old);
  assert.equal(result.kind, "Blog");
  assert.equal(result.slug, old.slug);
  assert.equal(result.body, old.body);
  assert.equal(postSchema.safeParse({ ...old, kind: "Unknown" }).success, false);
});
