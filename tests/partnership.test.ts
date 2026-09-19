import { test } from "node:test";
import assert from "node:assert/strict";
import { enquirySchema, enquiryKinds } from "../src/lib/enquiry";
import { copy } from "../src/app/(site)/quote/QuoteForm";

const base = {
  facility: "Acme Medical Devices",
  contact: "A Supplier",
  phone: "+251911000000",
  email: "",
  equipment: "Patient monitors",
  notes: "",
};

test("enquiries default to quotation and accept partnership", () => {
  assert.deepEqual([...enquiryKinds], ["quotation", "partnership"]);

  // An older form post with no kind field must still be a quotation.
  const legacy = enquirySchema.safeParse(base);
  assert.ok(legacy.success);
  assert.equal(legacy.data.kind, "quotation");

  const partner = enquirySchema.safeParse({ ...base, kind: "partnership" });
  assert.ok(partner.success);
  assert.equal(partner.data.kind, "partnership");

  // An unknown kind is rejected rather than silently stored.
  assert.equal(enquirySchema.safeParse({ ...base, kind: "spam" }).success, false);
});

test("the two form variants stay distinct and carry their kind", () => {
  assert.equal(copy.quotation.kind, "quotation");
  assert.equal(copy.partnership.kind, "partnership");

  // Quantity is meaningless for a manufacturer offering to distribute.
  assert.equal(copy.quotation.showQuantity, true);
  assert.equal(copy.partnership.showQuantity, false);

  // Both must name the company field, since it is reused for two meanings.
  assert.match(copy.quotation.fields[0].label, /Hospital|organization/i);
  assert.match(copy.partnership.fields[0].label, /Company/i);
  assert.notEqual(copy.quotation.mainLabel, copy.partnership.mainLabel);
});
