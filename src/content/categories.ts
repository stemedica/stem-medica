/**
 * Product categories. Names are real, drawn from STEM MEDICA's public posts;
 * the descriptions are LOREM until the client supplies copy.
 *
 * Re-added for the client brief ("Product list down with category"). The v1
 * design has no categories; only the v2 design set uses these.
 */
export type Category = {
  slug: string;
  name: string;
  short: string;
  blurb: string;
};

export const categories: Category[] = [
  { slug: "cardiac", name: "Cardiac & Perfusion", short: "Cardiac",
    blurb: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor." },
  { slug: "imaging", name: "Imaging & Radiography", short: "Imaging",
    blurb: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi." },
  { slug: "icu", name: "ICU & Critical Care", short: "ICU",
    blurb: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum." },
  { slug: "neonatal", name: "Neonatal", short: "Neonatal",
    blurb: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia." },
  { slug: "laboratory", name: "Laboratory & Diagnostics", short: "Lab",
    blurb: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium." },
  { slug: "ward", name: "Ward, Theatre & Furniture", short: "Ward",
    blurb: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit." },
];

/** Maps the demo catalogue onto the categories above. Design data only. */
export const categoryOf: Record<string, string> = {
  "s5-heart-lung-bypass": "cardiac",
  "schiller-abpm-holter": "cardiac",
  "bpl-rad-5-mobile-xray": "imaging",
  "portable-xray-unit": "imaging",
  "ambulanc-neonatal-cpap": "neonatal",
  "infant-radiant-warmer": "neonatal",
  "icheck-200-blood-gas": "laboratory",
  "multiparameter-patient-monitor": "icu",
  "defibrillator-monitor": "icu",
  "icu-electric-bed": "ward",
};
