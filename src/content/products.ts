/**
 * DEMO CATALOGUE.
 *
 * Device names, brands and origins are drawn from STEM MEDICA's own
 * public posts and are real. Everything else (summaries, specification values,
 * included services, availability and lead times) is LOREM IPSUM placeholder, so
 * nothing invented can be mistaken for a real specification or commitment.
 *
 * This shape is the data model: swap the array for a CMS or database read
 * returning the same `Product[]` and no component changes.
 */
export type Spec = { label: string; value: string };

export type Product = {
  slug: string;
  name: string;
  brand: string;
  origin: string;
  summary: string;
  specs: Spec[];
  services: string[];
  availability: "In stock, Addis Ababa" | "Indent order" | "On request";
  leadTime: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    slug: "s5-heart-lung-bypass",
    name: "S5 Heart-Lung (Bypass) Machine",
    brand: "Partner OEM",
    origin: "Europe",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    specs: [
      { label: "Configuration", value: "Lorem ipsum" },
      { label: "Monitoring", value: "Dolor sit amet" },
      { label: "Backup", value: "Consectetur 00" },
      { label: "Certification", value: "Adipiscing elit" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing", "Sed do eiusmod"],
    availability: "Indent order",
    leadTime: "Lorem 00",
    featured: true,
  },
  {
    slug: "schiller-abpm-holter",
    name: "SCHILLER Holter Blood Pressure Monitor (ABPM)",
    brand: "SCHILLER",
    origin: "Switzerland",
    summary:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    specs: [
      { label: "Recording", value: "Tempor 0.0" },
      { label: "Method", value: "Incididunt" },
      { label: "Range", value: "Lorem ipsum" },
      { label: "Software", value: "Dolor sit amet" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "In stock, Addis Ababa",
    leadTime: "Lorem 00",
    featured: true,
  },
  {
    slug: "bpl-rad-5-mobile-xray",
    name: "BPL RAD 5.0 Mobile Digital X-Ray",
    brand: "BPL Medical Technologies",
    origin: "India",
    summary:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    specs: [
      { label: "Generator", value: "Consectetur 00" },
      { label: "Detector", value: "Adipiscing elit" },
      { label: "Power", value: "Tempor 0.0" },
      { label: "Certification", value: "Incididunt" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "Indent order",
    leadTime: "Lorem 00",
    featured: true,
  },
  {
    slug: "portable-xray-unit",
    name: "Portable X-Ray Unit",
    brand: "Partner OEM",
    origin: "Asia",
    summary:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    specs: [
      { label: "Output", value: "Lorem ipsum" },
      { label: "Weight", value: "Dolor sit amet" },
      { label: "Detector", value: "Consectetur 00" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "On request",
    leadTime: "Lorem 00",
  },
  {
    slug: "ambulanc-neonatal-cpap",
    name: "Neonatal CPAP System",
    brand: "AMBULANC",
    origin: "China",
    summary:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem.",
    specs: [
      { label: "Mode", value: "Adipiscing elit" },
      { label: "Pressure", value: "Tempor 0.0" },
      { label: "Blender", value: "Incididunt" },
      { label: "Humidifier", value: "Lorem ipsum" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "In stock, Addis Ababa",
    leadTime: "Lorem 00",
    featured: true,
  },
  {
    slug: "infant-radiant-warmer",
    name: "Infant Radiant Warmer",
    brand: "Partner OEM",
    origin: "Asia",
    summary:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
    specs: [
      { label: "Control", value: "Dolor sit amet" },
      { label: "Probe", value: "Consectetur 00" },
      { label: "Options", value: "Adipiscing elit" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "Indent order",
    leadTime: "Lorem 00",
  },
  {
    slug: "icheck-200-blood-gas",
    name: "iCheck-200 Blood Gas Analyzer",
    brand: "B&E Technology",
    origin: "China",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    specs: [
      { label: "Panel", value: "Tempor 0.0" },
      { label: "Sample", value: "Incididunt" },
      { label: "Time to result", value: "Lorem ipsum" },
      { label: "Calibration", value: "Dolor sit amet" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "In stock, Addis Ababa",
    leadTime: "Lorem 00",
    featured: true,
  },
  {
    slug: "multiparameter-patient-monitor",
    name: "Multi-parameter Patient Monitor",
    brand: "Partner OEM",
    origin: "Asia",
    summary:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    specs: [
      { label: "Parameters", value: "Consectetur 00" },
      { label: "Display", value: "12–15\" touchscreen" },
      { label: "Battery", value: "Adipiscing elit" },
      { label: "Networking", value: "Tempor 0.0" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "In stock, Addis Ababa",
    leadTime: "Lorem 00",
  },
  {
    slug: "icu-electric-bed",
    name: "ICU Electric Hospital Bed",
    brand: "Partner OEM",
    origin: "Asia",
    summary:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    specs: [
      { label: "Functions", value: "Incididunt" },
      { label: "Platform", value: "Lorem ipsum" },
      { label: "Load", value: "Dolor sit amet" },
      { label: "Accessories", value: "Consectetur 00" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "Indent order",
    leadTime: "Lorem 00",
  },
  {
    slug: "defibrillator-monitor",
    name: "Defibrillator / Monitor",
    brand: "Partner OEM",
    origin: "Europe",
    summary:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    specs: [
      { label: "Waveform", value: "Adipiscing elit" },
      { label: "Energy", value: "Tempor 0.0" },
      { label: "Modes", value: "Incididunt" },
      { label: "Battery", value: "Lorem ipsum" },
    ],
    services: ["Lorem ipsum", "Dolor sit amet", "Consectetur adipiscing"],
    availability: "On request",
    leadTime: "Lorem 00",
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);
