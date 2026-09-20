import { test } from "node:test";
import assert from "node:assert/strict";
import { composeMailto, composeBody, composeSubject, MAILTO_LIMIT } from "../src/app/(site)/quote/compose-enquiry";
import { copy } from "../src/app/(site)/quote/form-copy";

const filled = {
  facility: "Tikur Anbessa Specialized Hospital",
  contact: "Dr Almaz Bekele",
  phone: "+251 911 234 567",
  email: "almaz@example.com",
  equipment: "Multiparameter patient monitors, ICU",
  quantity: "4",
  notes: "For the new 12-bed ICU wing.",
};

test("the draft carries every answer, aligned and readable", () => {
  const body = composeBody(filled, copy.quotation);
  assert.match(body, /Quotation request from the STEM MEDICA website\./);
  for (const value of ["Tikur Anbessa", "Dr Almaz Bekele", "+251 911 234 567", "almaz@example.com", "Multiparameter", "4"]) {
    assert.ok(body.includes(value), `body should contain ${value}`);
  }
  assert.match(body, /Notes:\n.*12-bed ICU wing/s);
  // Labels are padded to one column so the mail reads as a table in plain text.
  const labelWidths = body.split("\n").filter((l) => l.includes(" : ")).map((l) => l.indexOf(" : "));
  assert.equal(new Set(labelWidths).size, 1, "label column should be aligned");
});

test("the subject names who is asking, so the inbox is scannable", () => {
  assert.equal(composeSubject(filled, copy.quotation), "Quotation request: Tikur Anbessa Specialized Hospital");
  assert.equal(composeSubject({ ...filled, facility: "" }, copy.quotation), "Quotation request");
  assert.ok(composeSubject({ ...filled, facility: "x".repeat(400) }, copy.quotation).length <= 180);
});

test("partnership drafts relabel the fields and drop quantity", () => {
  const body = composeBody(filled, copy.partnership);
  assert.match(body, /Distribution partnership enquiry/);
  assert.match(body, /Company/);
  assert.ok(!body.includes("Quantity"), "quantity is meaningless for a supplier");
});

test("an empty optional email says so rather than leaving a blank", () => {
  assert.match(composeBody({ ...filled, email: "" }, copy.quotation), /Email\s+: not given/);
});

test("over-long notes are trimmed visibly, never cut mid-word by the mail client", () => {
  const { href, body } = composeMailto("info@example.com", { ...filled, notes: "n".repeat(6000) }, copy.quotation);
  assert.ok(href.length <= MAILTO_LIMIT, `mailto should fit, was ${href.length}`);
  assert.match(body, /Shortened to fit/);
  // Everything except the notes must survive the trim.
  for (const value of ["Tikur Anbessa", "Dr Almaz Bekele", "+251 911 234 567"]) {
    assert.ok(body.includes(value), `${value} must survive trimming`);
  }
});

test("the mailto is addressed and encoded correctly", () => {
  const { href } = composeMailto("info@stemedicaet.com", filled, copy.quotation);
  assert.ok(href.startsWith("mailto:info@stemedicaet.com?"), href.slice(0, 60));
  assert.match(href, /subject=/);
  assert.match(href, /body=/);
  assert.ok(!/[\s<>]/.test(href), "the URL must be fully encoded");
});
