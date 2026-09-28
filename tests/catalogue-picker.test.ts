import test from "node:test";
import assert from "node:assert/strict";
import { cataloguePickerPage } from "../src/lib/catalogue-picker";
import type { Catalogue, CmsProduct } from "../src/lib/cms-schema";

const product = (index: number, patch: Partial<CmsProduct> = {}): CmsProduct => ({
  slug: `product-${index}`,
  name: `Product ${index}`,
  brand: index === 9 ? "Searchable brand" : "Brand",
  model: "",
  origin: "",
  category: "diagnostics",
  image: "",
  summary: "",
  availability: "On request",
  leadTime: "",
  featured: false,
  published: true,
  specs: [],
  services: [],
  ...patch,
});

const catalogue: Catalogue = {
  categories: [{ slug: "diagnostics", name: "Diagnostic equipment", short: "Diagnostics", blurb: "", image: "" }],
  products: [...Array.from({ length: 10 }, (_, index) => product(index + 1)), product(11, { published: false })],
};

test("catalogue picker returns one bounded page of published products", () => {
  const defaultPage = cataloguePickerPage(catalogue, "", "1");
  assert.equal(defaultPage.products.length, 8);
  assert.equal(defaultPage.total, 10);
  const first = cataloguePickerPage(catalogue, "", "1", 4);
  assert.equal(first.products.length, 4);
  assert.deepEqual({ page: first.page, pages: first.pages, total: first.total }, { page: 1, pages: 3, total: 10 });
  const last = cataloguePickerPage(catalogue, "", "99", 4);
  assert.equal(last.page, 3);
  assert.equal(last.products.length, 2);
  assert.ok(last.products.every((entry) => entry.published));
});

test("catalogue picker searches product, brand and category before paging", () => {
  assert.deepEqual(cataloguePickerPage(catalogue, "searchable BRAND", "1").products.map((entry) => entry.slug), ["product-9"]);
  assert.equal(cataloguePickerPage(catalogue, "diagnostic equipment", "1").total, 10);
  assert.equal(cataloguePickerPage(catalogue, "missing", "1").total, 0);
});
