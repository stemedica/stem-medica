import { test } from "node:test";
import assert from "node:assert/strict";
import { homeEquipment } from "../src/lib/home-equipment";
import { previewCatalogue } from "../scripts/fixtures/local-preview-content";

test("homepage previews exclude drafts, prioritise featured, limit cards and trim payload", () => {
  const base = previewCatalogue.products[0];
  const products = Array.from({ length: 9 }, (_, index) => ({ ...base, slug: `equipment-${index}`, featured: index === 7, published: index !== 8, summary: "a".repeat(5000) }));
  const [all, ...categories] = homeEquipment({ categories: previewCatalogue.categories, products });
  assert.equal(all.count, 8);
  assert.equal(all.products.length, 6);
  assert.equal(all.products[0].slug, "equipment-7");
  assert.equal(all.products[0].summary.length, 180);
  assert.equal("specs" in all.products[0], false);
  assert.equal("published" in all.products[0], false);
  assert.ok(categories.some(category => category.count === 0));
  assert.equal(products[0].slug, "equipment-0");
});

test("unfeatured, uncategorised and empty catalogues remain browsable", () => {
  assert.deepEqual(homeEquipment({ products: [], categories: [] }), [{ slug: "", name: "All equipment", count: 0, products: [] }]);
  const product = { ...previewCatalogue.products[0], category: "", featured: false, published: true };
  const groups = homeEquipment({ products: [product], categories: previewCatalogue.categories });
  assert.equal(groups[0].count, 1);
  assert.ok(groups.slice(1).every(group => group.count === 0));
});
