import { catalogueSchema } from "../../src/lib/cms-schema";
import { postsSchema } from "../../src/lib/post-schema";

// Manufacturer references are documented in docs/LOCAL-PREVIEW.md.
// These are preview records, not claims about STEM MEDICA stock or partnerships.
export const previewCatalogue = catalogueSchema.parse({
  categories: [
    { slug: "test-patient-monitoring", name: "Patient monitoring — test", short: "Monitoring", blurb: "Explore monitoring equipment for bedside and transport workflows. Local preview category." },
    { slug: "test-diagnostic-cardiology", name: "Diagnostic cardiology — test", short: "Cardiology", blurb: "Resting ECG equipment for reviewing procurement and installation requirements. Local preview category." },
    { slug: "test-critical-care", name: "Critical care — test", short: "Critical care", blurb: "Equipment for critical care procurement enquiries. Local preview category." },
  ],
  products: [
    { slug: "test-mindray-benevision-n1", name: "BeneVision N1 patient monitor — test", brand: "Mindray", category: "test-patient-monitoring", summary: "Local test entry, not confirmed stock. BeneVision N1 is a patient monitor with transport, bedside and module configurations. Confirm the model configuration and accessories with the supplier before ordering.", specs: [{ label: "Equipment type", value: "Patient monitor" }, { label: "Manufacturer product family", value: "BeneVision N1" }], services: [], availability: "On request", leadTime: "Test content — no delivery commitment", featured: true, published: true },
    { slug: "test-ge-mac-5", name: "MAC 5 resting ECG — test", brand: "GE HealthCare", category: "test-diagnostic-cardiology", summary: "Local test entry, not confirmed stock. MAC 5 is a resting ECG system. This example lets you review how equipment details, enquiry links and manual quotations work together.", specs: [{ label: "Equipment type", value: "Resting ECG system" }, { label: "Model", value: "MAC 5" }], services: [], availability: "On request", leadTime: "Test content — confirm availability", featured: true, published: true },
    { slug: "test-drager-savina-300", name: "Savina 300 Select ventilator — test", brand: "Dräger", category: "test-critical-care", summary: "Local test entry, not confirmed stock. Savina 300 Select is a turbine-driven intensive care ventilator. Configuration, accessories and local availability must be confirmed separately.", specs: [{ label: "Equipment type", value: "Intensive care ventilator" }, { label: "Platform", value: "Turbine-driven ventilation" }], services: [], availability: "On request", leadTime: "Test content — no delivery commitment", featured: true, published: true },
  ],
});

export const previewPosts = postsSchema.parse([
  {
    id: "01994ddd-1000-4000-8000-000000000001", slug: "test-preparing-an-equipment-enquiry", title: "Preparing a useful equipment enquiry — test article", date: "2026-09-16", kind: "Blog", author: "STEM MEDICA · Local preview", image: "", published: true,
    excerpt: "A practical procurement checklist covering equipment names, quantities, delivery locations and the details needed for a clear quotation. Local test article.",
    body: "This is a local test article for reviewing the website. It is not a quotation, clinical recommendation or announcement of available stock.\n\n## Start with the equipment list\n\nWrite down the equipment names and quantities your facility needs. If your team already has an approved specification or preferred model, include it with the enquiry. This helps keep the quotation aligned with the procurement request.\n\n- Equipment name and model, if known\n- Quantity for each item\n- Required accessories or consumables\n\n## Include the delivery location\n\nProvide the facility name, city and installation location. Mention any access restrictions that could affect delivery. Ask the supplier to confirm delivery and installation arrangements in writing.\n\n## Review the quotation details\n\nCheck the model, quantities, currency, validity period and payment terms. Ask whether installation, training and warranty support are included. Avoid assuming that accessories shown in a manufacturer’s photograph are part of the quoted package.\n\n## Keep a point of contact\n\nInclude a contact name, telephone number and email address. Share the final equipment list with both your procurement and technical teams before requesting a proforma.",
  },
  {
    id: "01994ddd-1000-4000-8000-000000000002", slug: "test-monitoring-range-preview", title: "Patient monitoring range: catalogue preview — test update", date: "2026-09-15", kind: "Upcoming arrival", author: "STEM MEDICA · Local preview", image: "", published: true,
    excerpt: "Preview how an upcoming-equipment update will appear, with a monitoring example and a clear route to an enquiry. No shipment is being announced.",
    body: "Local test update only. This entry demonstrates the Upcoming arrival section; it does not announce a shipment, arrival date or available inventory.\n\n## Equipment under review\n\nThe local preview catalogue includes the Mindray BeneVision N1 as an example of a patient monitoring product. Its manufacturer describes transport, bedside and module configurations. A real procurement enquiry should identify the configuration and accessories required.\n\n## Before an arrival is announced\n\nConfirm the model list, quantities and expected schedule with the supplier. Replace this test entry with an approved announcement when those details are ready.\n\n## Ask about your requirements\n\nUse the equipment enquiry page to list your facility, equipment and quantities. Prices and delivery terms are confirmed manually by the team.",
  },
  {
    id: "01994ddd-1000-4000-8000-000000000003", slug: "test-order-review-checklist", title: "From equipment list to proforma — test order update", date: "2026-09-14", kind: "Blog", author: "STEM MEDICA · Local preview", image: "", published: true,
    excerpt: "A sample order-review update showing the information to check before a proforma is approved. No customer order or delivery is represented.",
    body: "This local test entry demonstrates the Order update format. It does not describe a real customer, purchase order or delivery.\n\n## Confirm the equipment list\n\nReview equipment descriptions and quantities against the facility’s request. Keep any substitutions explicit so the buyer can approve them before proceeding.\n\n## Review the proforma\n\nThe team enters prices manually. Check the currency, payment terms, validity and delivery wording before sharing the document with the customer.\n\n## Prepare the next update\n\nAn actual order update should report only confirmed progress. Keep customer names, contact details and private commercial information out of public posts unless publication has been approved.",
  },
]);
