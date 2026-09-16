import test from "node:test";
import assert from "node:assert/strict";
import { categorySlug } from "../src/lib/category-slug";

test("category links are generated safely without manual slug entry", () => {
  assert.equal(categorySlug("Critical Care & ICU", []), "critical-care-icu");
  assert.equal(categorySlug("Critical Care", ["critical-care", "critical-care-2"]), "critical-care-3");
  assert.equal(categorySlug("Équipement", []), "equipement");
  assert.equal(categorySlug("ሕክምና", ["category"]), "category-2");
  assert.equal(categorySlug("A".repeat(200), []).length, 85);
});
