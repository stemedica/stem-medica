import { test } from "node:test";
import assert from "node:assert/strict";
import { copy } from "../src/app/(site)/quote/form-copy";

test("the two form variants stay distinct", () => {
  assert.equal(copy.quotation.kind, "quotation");
  assert.equal(copy.partnership.kind, "partnership");

  // Quantity is meaningless for a manufacturer offering to distribute.
  assert.equal(copy.quotation.showQuantity, true);
  assert.equal(copy.partnership.showQuantity, false);

  // The company field is reused for two different meanings, so it must be
  // labelled differently in each.
  assert.match(copy.quotation.fields[0].label, /Hospital|organization/i);
  assert.match(copy.partnership.fields[0].label, /Company/i);
  assert.notEqual(copy.quotation.mainLabel, copy.partnership.mainLabel);
});
