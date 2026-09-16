import test from "node:test";
import assert from "node:assert/strict";
import { mapConcurrent } from "../src/lib/map-concurrent";
import { money, blankItem } from "../src/app/test/admin/proforma";
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

test("drafts allow repeated equipment but reject duplicate internal row IDs", () => {
  const first = blankItem(), second = blankItem();
  assert.notEqual(first.id, second.id);
  const draft = {
    issuer: { name: "", address: "", tin: "", vatReg: "", phone: "", email: "", bank: "", account: "" },
    doc: { number: "TEST", date: "2026-09-16", validity: "", currency: "ETB", vatRate: 15,
      client: { name: "", attn: "", address: "", tin: "" }, items: [first, second], notes: "", delivery: "", payment: "" },
  };
  assert.equal(draftSchema.safeParse(draft).success, true);
  draft.doc.items[1] = first;
  assert.equal(draftSchema.safeParse(draft).success, false);
});
