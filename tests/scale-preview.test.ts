import test from "node:test";
import assert from "node:assert/strict";
import { buildScalePreview } from "../scripts/fixtures/scale-preview-content";
import { previewCatalogue, previewPosts } from "../scripts/fixtures/local-preview-content";

test("scale seed reaches exact totals, preserves existing entries and is repeatable", () => {
  const result = buildScalePreview(previewCatalogue, previewPosts, "2026-09-17");
  assert.equal(result.catalogue.products.length, 100);
  assert.equal(result.catalogue.categories.length, 10);
  assert.equal(result.posts.length, 60);
  for (const category of result.catalogue.categories) assert.equal(result.catalogue.products.filter(p => p.category === category.slug).length, 10);
  for (const p of previewCatalogue.products) assert.deepEqual(result.catalogue.products.find(n => n.slug === p.slug), p);
  for (const p of previewPosts) assert.deepEqual(result.posts.find(n => n.id === p.id), p);
  assert.deepEqual(buildScalePreview(result.catalogue, result.posts, "2026-10-17"), result);
  assert.equal(new Set(result.posts.map(p => p.id)).size, 60);
  assert.equal(new Set(result.catalogue.products.map(p => p.name)).size, 100);
  assert.throws(() => buildScalePreview({ ...result.catalogue, categories: [...result.catalogue.categories, { ...result.catalogue.categories[0], slug: "other" }] }, result.posts, "2026-09-17"));
});
