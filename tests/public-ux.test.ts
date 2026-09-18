import { test } from "node:test";
import assert from "node:assert/strict";
import { paginate } from "../src/lib/pagination";
import { postSections } from "../src/lib/post-slug";
import { previewCatalogue, previewPosts } from "../scripts/fixtures/local-preview-content";

test("pagination bounds invalid pages and preserves a final partial page", () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  assert.deepEqual(paginate(items, "2", 24).items, [24]);
  for (const invalid of [undefined, "-1", "foo", "0", ["2", "3"]]) assert.equal(paginate(items, invalid).page, 1);
  assert.equal(paginate(items, "999").page, 3);
  assert.deepEqual(paginate([], "2"), { items: [], page: 1, pages: 1 });
});

test("article contents use unique IDs matching rendered block indices", () => {
  assert.deepEqual(postSections("Intro\n\n## Details\n\nText\n\n### Details"), [{ id: "section-1", title: "Details" }, { id: "section-3", title: "Details" }]);
  assert.equal(postSections("## Not a standalone heading\nText").length, 0);
});

test("preview content is valid, labelled and does not specify prices", () => {
  assert.equal(previewCatalogue.products.length, 3);
  assert.equal(previewPosts.length, 3);
  for (const product of previewCatalogue.products) { assert.match(product.name, /test/i); assert.equal(product.availability, "On request"); assert.equal("price" in product, false); }
  for (const post of previewPosts) { assert.match(post.title, /test/i); assert.ok(!/lorem ipsum/i.test(post.body)); }
});
