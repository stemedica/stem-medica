/**
 * Replace the catalogue with STEM MEDICA's real supply categories and one
 * sample product in each, so the site can be reviewed with the right structure
 * before real product data arrives.
 *
 * Categories are real. Products are clearly labelled sample entries: names and
 * specifications still need confirming, and none of them is a stock claim.
 *
 * Only catalogue/current.json is touched. Posts and proforma drafts are left
 * alone.
 *
 *   CATALOGUE_SEED_CONFIRM=replace npx tsx scripts/seed-catalogue.ts
 */
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { catalogueSchema } from "../src/lib/cms-schema";

const KEY = "catalogue/current.json";

type Seed = {
  slug: string; name: string; short: string; blurb: string;
  product: { slug: string; name: string; summary: string; specs: [string, string][]; featured?: boolean };
};

const SUPPLY: Seed[] = [
  {
    slug: "monitoring-equipment", name: "Monitoring equipment", short: "Monitoring",
    blurb: "Bedside and transport patient monitors, central stations, pulse oximeters and ambulatory blood pressure recorders for ICU, theatre and ward use.",
    product: {
      slug: "multiparameter-patient-monitor", name: "Multiparameter patient monitor",
      summary: "Sample catalogue entry. Bedside monitor for ICU, high-dependency and recovery areas, configurable from five parameters upward and central-station ready. Configuration, accessories and availability are confirmed before quotation.",
      specs: [["Parameters", "ECG, SpO₂, NIBP, respiration, temperature; IBP and EtCO₂ optional"], ["Use", "ICU, HDU, theatre and recovery"], ["Networking", "Central station compatible"]],
      featured: true,
    },
  },
  {
    slug: "emergency-equipment", name: "Emergency equipment", short: "Emergency",
    blurb: "Defibrillators, resuscitation trolleys, suction units, transport ventilators and ambulance equipment for emergency departments and pre-hospital care.",
    product: {
      slug: "biphasic-defibrillator", name: "Biphasic defibrillator with monitoring",
      summary: "Sample catalogue entry. Defibrillator with monitoring and pacing for emergency, theatre and ambulance use. Energy range, modes and accessories are confirmed before quotation.",
      specs: [["Waveform", "Biphasic"], ["Modes", "Manual, AED, synchronised cardioversion, pacing"], ["Use", "Emergency, theatre, ambulance"]],
      featured: true,
    },
  },
  {
    slug: "diagnostic-equipment", name: "Diagnostic equipment", short: "Diagnostics",
    blurb: "ECG machines, ultrasound systems, spirometers, Holter and ambulatory blood pressure recorders, and point-of-care analysers for outpatient and specialist clinics.",
    product: {
      slug: "twelve-channel-ecg", name: "12-channel ECG machine",
      summary: "Sample catalogue entry. Resting ECG for outpatient, cardiology and pre-operative assessment, with interpretation software and reporting. Model and software options are confirmed before quotation.",
      specs: [["Channels", "12-lead, simultaneous acquisition"], ["Output", "Thermal printout and digital report"], ["Use", "Outpatient, cardiology, pre-operative"]],
    },
  },
  {
    slug: "surgical-equipment", name: "Surgical equipment", short: "Surgical",
    blurb: "Operating theatre equipment including electrosurgical units, anaesthesia machines, surgical lights, instrument sets, autoclaves and sterilisation.",
    product: {
      slug: "electrosurgical-unit", name: "Electrosurgical unit",
      summary: "Sample catalogue entry. Diathermy unit for general and specialist surgery, with monopolar and bipolar output and patient-return monitoring. Power rating and accessories are confirmed before quotation.",
      specs: [["Output", "Monopolar and bipolar"], ["Safety", "Patient-return electrode monitoring"], ["Use", "General and specialist theatre"]],
    },
  },
  {
    slug: "medical-furniture", name: "Medical furniture", short: "Furniture",
    blurb: "Electric and manual hospital beds, examination couches, trolleys, bedside cabinets, operating tables and ward seating.",
    product: {
      slug: "electric-icu-bed", name: "Electric ICU bed",
      summary: "Sample catalogue entry. Five-function electric bed with CPR release and an X-ray translucent platform, supplied with side rails, IV pole and mattress. Accessories and finish are confirmed before quotation.",
      specs: [["Functions", "Five-function electric with CPR release"], ["Platform", "X-ray translucent"], ["Supplied with", "Side rails, IV pole, mattress"]],
      featured: true,
    },
  },
  {
    slug: "orthopedic-products", name: "Orthopedic products", short: "Orthopedic",
    blurb: "Orthopaedic implants, external fixation, casting and splinting materials, traction equipment, mobility aids and rehabilitation supports.",
    product: {
      slug: "external-fixation-set", name: "External fixation set",
      summary: "Sample catalogue entry. Modular external fixation for trauma and reconstructive orthopaedics. Set contents, sizes and sterilisation requirements are confirmed before quotation.",
      specs: [["Type", "Modular external fixator"], ["Use", "Trauma and reconstructive orthopaedics"], ["Supply", "Set contents confirmed per case mix"]],
    },
  },
  {
    slug: "dental-equipment", name: "Dental equipment", short: "Dental",
    blurb: "Dental chairs and units, handpieces, curing lights, scalers, intra-oral and panoramic X-ray units, and dental consumables.",
    product: {
      slug: "dental-chair-unit", name: "Dental chair unit",
      summary: "Sample catalogue entry. Complete dental treatment unit with chair, delivery system, operating light and assistant console. Configuration and handpiece options are confirmed before quotation.",
      specs: [["Includes", "Chair, delivery system, operating light, assistant console"], ["Use", "Dental clinics and hospital dental departments"], ["Utilities", "Compressed air and suction requirements confirmed on survey"]],
    },
  },
  {
    slug: "medical-imaging", name: "Medical imaging", short: "Imaging",
    blurb: "Fixed, mobile and portable X-ray systems, digital radiography detectors, ultrasound scanners, and imaging accessories and protection.",
    product: {
      slug: "mobile-digital-xray", name: "Mobile digital X-ray system",
      summary: "Sample catalogue entry. Motorised mobile digital radiography for ward, ICU and theatre imaging where moving the patient carries more risk. Generator output and detector are confirmed before quotation.",
      specs: [["Type", "Mobile digital radiography"], ["Detector", "Wireless flat panel"], ["Use", "Ward, ICU and theatre imaging"]],
      featured: true,
    },
  },
  {
    slug: "laboratory-equipment", name: "Laboratory equipment", short: "Laboratory",
    blurb: "Haematology, chemistry and blood gas analysers, microscopes, centrifuges, incubators, autoclaves and laboratory consumables and reagents.",
    product: {
      slug: "blood-gas-analyser", name: "Blood gas and electrolyte analyser",
      summary: "Sample catalogue entry. Compact analyser for ICU, emergency and theatre, giving blood gas and electrolyte results at the point of care. Panel, cartridge supply and throughput are confirmed before quotation.",
      specs: [["Panel", "Blood gas and electrolytes"], ["Sample", "Whole blood, small volume"], ["Use", "ICU, emergency and theatre"]],
    },
  },
  {
    slug: "wound-care-products", name: "Wound care products", short: "Wound care",
    blurb: "Advanced dressings, negative pressure wound therapy, bandages, sutures and antiseptics for theatre, ward and outpatient wound management.",
    product: {
      slug: "negative-pressure-wound-therapy", name: "Negative pressure wound therapy unit",
      summary: "Sample catalogue entry. Portable NPWT unit for complex and post-surgical wounds, supplied with dressing kits and canisters. Consumable supply is agreed before the unit is delivered.",
      specs: [["Type", "Portable negative pressure wound therapy"], ["Use", "Complex and post-surgical wounds"], ["Consumables", "Dressing kits and canisters supplied"]],
    },
  },
];

const SERVICES = [
  "Site survey before quotation",
  "Installation and commissioning",
  "Operator training on handover",
  "Spare parts and technical support",
];

async function main() {
  if (process.env.CATALOGUE_SEED_CONFIRM !== "replace") {
    throw new Error("Set CATALOGUE_SEED_CONFIRM=replace to rewrite the catalogue.");
  }
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) throw new Error("DATABASE_URL_UNPOOLED is required.");

  const catalogue = catalogueSchema.parse({
    categories: SUPPLY.map(({ slug, name, short, blurb }) => ({ slug, name, short, blurb, image: "" })),
    products: SUPPLY.map(({ slug: category, product }) => ({
      slug: product.slug,
      name: product.name,
      brand: "To be confirmed",
      origin: "",
      category,
      image: "",
      summary: product.summary,
      availability: "On request" as const,
      leadTime: "Confirmed on enquiry",
      featured: product.featured ?? false,
      published: true,
      specs: product.specs.map(([label, value]) => ({ label, value })),
      services: SERVICES,
    })),
  });

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
  try {
    await pool.query(
      `INSERT INTO content_document (key, data, revision, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, revision = EXCLUDED.revision, updated_at = NOW()`,
      [KEY, JSON.stringify(catalogue), randomUUID()],
    );
    console.log(`Catalogue replaced: ${catalogue.categories.length} categories, ${catalogue.products.length} products.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Catalogue seed failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
