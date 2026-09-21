import { strict as assert } from "node:assert";
import { test } from "node:test";
import { copy } from "../src/app/(site)/quote/form-copy";
import { enquiryHtml, enquiryRows, enquirySubject, enquiryText } from "../src/app/(site)/quote/enquiry-message";

const quotation = {
  kind: "quotation",
  facility: "Black Lion Specialized Hospital",
  contact: "Dr. Selam Bekele",
  phone: "0911234567",
  email: "selam@example.com",
  equipment: "Neonatal CPAP system",
  quantity: "3",
  notes: "For the NICU.",
};

test("the subject names the facility so replies are searchable", () => {
  assert.equal(enquirySubject(quotation, copy.quotation), "Quotation request: Black Lion Specialized Hospital");
  assert.equal(enquirySubject({ facility: "  " }, copy.quotation), "Quotation request");
});

test("the text body aligns every label and keeps the notes last", () => {
  const text = enquiryText(quotation, copy.quotation);
  assert.match(text, /^Quotation request from the STEM MEDICA website\.$/m);
  const width = "Hospital or organization".length;
  assert.ok(text.includes(`${"Contact".padEnd(width)} : Dr. Selam Bekele`));
  assert.ok(text.includes(`${"Quantity".padEnd(width)} : 3`));
  assert.ok(text.endsWith("Notes:\nFor the NICU."));
});

test("an omitted optional email reads as absent rather than blank", () => {
  const rows = enquiryRows({ ...quotation, email: "  " }, copy.quotation);
  assert.deepEqual(rows.find(([label]) => label === "Email"), ["Email", "not given"]);
});

test("quantity is dropped when the variant has no quantity field", () => {
  const labels = enquiryRows(quotation, copy.partnership).map(([label]) => label);
  assert.ok(!labels.includes("Quantity"));
  assert.ok(labels.includes("Products you manufacture or export"));
});

test("html escapes visitor input so a pasted tag cannot become markup", () => {
  const html = enquiryHtml({ ...quotation, facility: `<script>alert("x")</script>` }, copy.quotation);
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
});

test("notes survive into the html with their line breaks preserved", () => {
  const html = enquiryHtml({ ...quotation, notes: "line one\nline two" }, copy.quotation);
  assert.match(html, /white-space:pre-wrap">line one\nline two</);
});
