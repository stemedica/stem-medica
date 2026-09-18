import { test } from "node:test";
import assert from "node:assert/strict";
import { enquirySchema } from "../src/lib/enquiry";

test("enquiry validation accepts the useful minimum and normalizes optional fields", () => {
  const parsed = enquirySchema.parse({
    facility: "  Addis Clinic ",
    contact: "Natinael",
    phone: "+251900000000",
    email: "",
    equipment: "Patient monitor",
    notes: "",
  });
  assert.equal(parsed.facility, "Addis Clinic");
  assert.equal(parsed.quantity, undefined);
});

test("enquiry validation rejects invalid email, quantity and the bot field", () => {
  const base = { facility: "Clinic", contact: "Name", phone: "0911000000", equipment: "Monitor", notes: "" };
  assert.equal(enquirySchema.safeParse({ ...base, email: "wrong", quantity: "0" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...base, email: "", quantity: "1", website: "spam" }).success, false);
});
