import test from "node:test";
import assert from "node:assert/strict";
import { mapConcurrent } from "../src/lib/map-concurrent";
import { addCatalogueProduct, money, blankItem, totals, type Proforma } from "../src/app/admin/proforma";
import { draftSchema } from "../src/lib/cms-schema";

test("bounded reads preserve order and do not exceed the concurrency limit", async () => {
  let active = 0, peak = 0;
  const result = await mapConcurrent([5, 4, 3, 2, 1], 2, async (value) => {
    active++; peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, value));
    active--; return value * 2;
  });
  assert.deepEqual(result, [10, 8, 6, 4, 2]);
  assert.equal(peak, 2);
  assert.deepEqual(await mapConcurrent([], 3, async () => 1), []);
  await assert.rejects(mapConcurrent([1], 0, async () => 1));
  await assert.rejects(mapConcurrent([1], 1, async () => { throw new Error("Read failed"); }), /Read failed/);
});

test("reused number formatter preserves existing amounts and currencies", () => {
  for (const value of [0, -12.25, 1000, 1.005, 9999999.99]) {
    assert.equal(money(value, "ETB"), `ETB ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  }
  assert.equal(money(10, "USD"), "USD 10.00");
});

test("drafts reject duplicate internal row IDs and remain compatible with pre-VAT-toggle drafts", () => {
  const first = blankItem(), second = blankItem();
  assert.notEqual(first.id, second.id);
  const draft = {
    issuer: { name: "", address: "", tin: "", vatReg: "", phone: "", email: "", bank: "", account: "" },
    doc: { number: "TEST", date: "2026-09-16", validity: "", currency: "ETB", vatRate: 15,
      client: { name: "", attn: "", address: "", tin: "" }, items: [first, second], notes: "", delivery: "", payment: "" },
  };
  assert.equal(draftSchema.safeParse(draft).success, true);
  assert.equal(draftSchema.parse(draft).doc.includeVat, true);
  draft.doc.items[1] = first;
  assert.equal(draftSchema.safeParse(draft).success, false);
});

const proforma = (): Proforma => ({
  number: "TEST", date: "2026-09-17", validity: "", currency: "ETB", includeVat: true, vatRate: 15,
  client: { name: "", attn: "", address: "", tin: "" }, items: [blankItem()], notes: "", delivery: "", payment: "",
});

test("VAT can be excluded without losing its configured rate", () => {
  const included = { ...proforma(), items: [{ ...blankItem(), qty: 2, price: 100 }] };
  assert.deepEqual(totals(included), { subtotal: 200, vat: 30, grand: 230 });
  assert.deepEqual(totals({ ...included, includeVat: false }), { subtotal: 200, vat: 0, grand: 200 });
  assert.equal(included.vatRate, 15);
});

test("adding the same catalogue product increases quantity and preserves its row", () => {
  const product = { slug: "monitor", name: "Patient monitor", brand: "Test brand" };
  const added = addCatalogueProduct(proforma(), product);
  const priced = { ...added, items: added.items.map((item) => ({ ...item, price: 1250 })) };
  const repeated = addCatalogueProduct(priced, product);
  assert.equal(repeated.items.length, 1);
  assert.equal(repeated.items[0].id, priced.items[0].id);
  assert.equal(repeated.items[0].qty, 2);
  assert.equal(repeated.items[0].price, 1250);
  assert.equal(repeated.items[0].catalogueSlug, product.slug);
});

test("adding a catalogue product recognizes legacy rows and still works at the row limit", () => {
  const product = { slug: "monitor", name: "Patient monitor", brand: "Test brand" };
  const legacy = { ...blankItem(), description: "Patient monitor — Test brand", qty: 4, price: 50 };
  const full = { ...proforma(), items: [legacy, ...Array.from({ length: 99 }, () => ({ ...blankItem(), description: "Manual item" }))] };
  const repeated = addCatalogueProduct(full, product);
  assert.equal(repeated.items.length, 100);
  assert.equal(repeated.items[0].qty, 5);
  assert.equal(repeated.items[0].price, 50);
  assert.equal(repeated.items[0].catalogueSlug, product.slug);
  assert.equal(addCatalogueProduct(full, { slug: "new", name: "New", brand: "Product" }).items.length, 100);
});
