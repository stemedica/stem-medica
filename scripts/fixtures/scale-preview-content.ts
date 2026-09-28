import { createHash } from "node:crypto";
import { catalogueSchema, type Catalogue } from "../../src/lib/cms-schema";
import { postsSchema, type CmsPost } from "../../src/lib/post-schema";

const families = [
  ["test-patient-monitoring", "Patient monitoring", "Patient monitor", 1],
  ["test-diagnostic-cardiology", "Diagnostic cardiology", "Resting ECG system", 2],
  ["test-critical-care", "Critical care", "ICU ventilator", 3],
  ["test", "Sterilization & infection control", "Tabletop steam sterilizer", 4],
  ["test2", "Laboratory equipment", "Binocular laboratory microscope", 5],
  ["test-ward-monitoring", "Ward monitoring", "Ward patient monitor", 1],
  ["test-outpatient-cardiology", "Outpatient cardiology", "Outpatient ECG system", 2],
  ["test-respiratory-equipment", "Respiratory equipment", "Ventilation system", 3],
  ["test-instrument-processing", "Instrument processing", "Instrument sterilizer", 4],
  ["test-teaching-microscopy", "Teaching microscopy", "Teaching microscope", 5],
] as const;
const contexts = ["General facility", "Procurement review", "Equipment replacement", "Department expansion", "Accessory review", "Installation planning", "Training handover", "Service planning", "Delivery review", "Specification review"];
const topics = [
  ["Preparing an equipment enquiry", "List the requested equipment, quantities and delivery location. Separate required accessories from optional additions so the supplier can respond to each item."],
  ["Comparing supplier quotations", "Compare the equipment description, included accessories and written scope of supply. Keep substitutions explicit and request clarification where descriptions differ."],
  ["Planning a delivery handover", "Nominate a receiving contact and agree how equipment and documents will be checked on delivery. Confirm the delivery arrangements with the supplier before scheduling."],
  ["Organising equipment documents", "Keep the quotation, approved specification and supplier correspondence together. Record which revision was approved so later changes can be traced."],
  ["Discussing service support", "Ask the supplier to describe available installation, training and service support in writing. Do not assume these services are included in the equipment price."],
  ["Reviewing a manual proforma", "Check quantities, descriptions, currency and validity before approving a proforma. Pricing and commercial terms are entered and reviewed manually by the team."],
] as const;

/** Adds only; exact targets; stable identities make reruns non-destructive. */
export function buildScalePreview(catalogue: Catalogue, posts: CmsPost[], today: string) {
  const next = structuredClone(catalogue);
  const nextPosts = structuredClone(posts);
  if (next.categories.length > 10 || next.products.length > 100 || posts.length > 60) throw new Error("Existing content exceeds requested totals");
  if (next.categories.some(c => !families.some(([slug]) => slug === c.slug))) throw new Error("Unexpected category; review before seeding");
  for (const [slug, title, equipment, imageIndex] of families) {
    const image = `/media/01994eee-3000-4000-8000-00000000000${imageIndex}.webp`;
    if (!next.categories.some(c => c.slug === slug)) next.categories.push({
      slug, name: `${title} — test`, short: title, image,
      blurb: `Test category for ${title.toLowerCase()} enquiries. Illustrative equipment only; not confirmed inventory, specifications or delivery availability.`,
    });
    const existingCount = next.products.filter(p => p.category === slug).length;
    if (existingCount > 10) throw new Error("Category already exceeds ten entries");
    let count = existingCount;
    for (let variant = 0; count < 10; variant++) {
      const productSlug = `test-scale-${slug}-${String(variant + 1).padStart(2, "0")}`;
      if (next.products.some(p => p.slug === productSlug)) continue;
      if (variant >= 10) throw new Error("Unexpected product identities");
      const context = contexts[variant];
      next.products.push({
        slug: productSlug, name: `${equipment} · ${context} — test`, brand: "Preview equipment (test)",
        model: "", category: slug, image, origin: "", published: true, featured: false,
        summary: `Labelled test equipment for ${context.toLowerCase()}. This ${equipment.toLowerCase()} entry exercises catalogue search, category browsing and manual quotation requests. The image is a generic illustration, not a manufacturer's model photograph. No stock or performance claim is made.`,
        availability: "On request", leadTime: "Test content — confirm delivery separately", services: [],
        specs: [{ label: "Equipment family", value: equipment }, { label: "Preview scenario", value: context }, { label: "Record status", value: "Test entry; not an approved procurement specification" }],
      });
      count++;
    }
  }
  for (let index = 0; nextPosts.length < 60 && index < 60; index++) {
    const family = families[Math.floor(index / topics.length)];
    const [topic, guidance] = topics[index % topics.length];
    const slug = `test-scale-${family[0]}-article-${index % topics.length + 1}`;
    if (nextPosts.some(p => p.slug === slug)) continue;
    const hash = createHash("sha256").update(slug).digest("hex");
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const date = new Date(Date.parse(`${today}T12:00:00Z`) - index * 86_400_000).toISOString().slice(0, 10);
    nextPosts.push({
      id, slug, title: `${topic}: ${family[1].toLowerCase()} — test article`, date, kind: "Blog",
      author: "STEM MEDICA · Test preview", image: `/media/01994eee-3000-4000-8000-00000000000${family[3]}.webp`, published: true,
      excerpt: `A test procurement note for ${family[1].toLowerCase()}. ${guidance}`,
      body: `Test article for website browsing and pagination. This is not clinical guidance, a supplier commitment or a stock announcement. The cover is a generic test illustration.\n\n## ${topic}\n\n${guidance}\n\n## Apply it to ${family[1].toLowerCase()}\n\nUse the facility's approved equipment requirements when preparing an enquiry for a ${family[2].toLowerCase()}. Ask the supplier to identify the proposed model and its included accessories. Do not treat this illustrative catalogue entry as a technical specification.\n\n## Keep the review clear\n\n- Identify the facility and a contact person.\n- State equipment names and quantities.\n- Record questions and any agreed changes in writing.\n- Request confirmation of the supply scope and commercial terms.\n\n## Before approval\n\nShare the proposed equipment list with the relevant procurement and technical reviewers. Check that their approved requirements are reflected in the final quotation. Replace this sample article with reviewed company content before production launch.`,
    });
  }
  if (next.categories.length !== 10 || next.products.length !== 100 || nextPosts.length !== 60) throw new Error("Could not reach exact targets without removing entries");
  return { catalogue: catalogueSchema.parse(next), posts: postsSchema.parse(nextPosts) };
}
