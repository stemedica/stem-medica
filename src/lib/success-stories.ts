/**
 * Default homepage achievement story cards.
 *
 * These describe the core clinical and facility equipping work STEM MEDICA
 * provides across Ethiopia. When published achievements exist in the CMS/admin,
 * those take precedence. Otherwise, these curated facility stories ensure the
 * Achievements section is always informative, complete, and engaging.
 */

export type SuccessStory = {
  title: string;
  place: string;
  summary: string;
  image?: string;
  postSlug?: string;
};

export const successStories: SuccessStory[] = [
  {
    title: "Wards, theatres and intensive care",
    place: "Addis Ababa & Regional Referral Hospitals",
    summary:
      "Patient monitors, defibrillators, electrosurgical units and ICU beds, delivered and commissioned on site with the medical teams who use them daily.",
    image: "/hero-theatre.jpg",
  },
  {
    title: "Diagnostic imaging suites",
    place: "Specialized Hospitals & Diagnostic Centres",
    summary:
      "Mobile digital X-ray, high-resolution ultrasound and ECG equipment, installed and handed over with hands-on clinical training so facilities can immediately serve patients.",
    image: "/stem-medica.jpg",
  },
  {
    title: "Laboratory commissioning",
    place: "Clinical & Diagnostic Laboratories",
    summary:
      "Clinical chemistry, blood gas and electrolyte analysers, fully calibrated with sustained supply of reagents, consumables and biomedical technical support.",
  },
  {
    title: "Emergency & trauma readiness",
    place: "Emergency Departments & Ambulances",
    summary:
      "Defibrillators, transport ventilators, emergency suction units and resuscitation equipment for critical response teams that cannot afford downtime.",
  },
  {
    title: "Dental clinic equipping",
    place: "Dental & Maxillofacial Clinics",
    summary:
      "Ergonomic dental chair units, compressors, intraoral sensors and autoclaves, backed by genuine spare parts and scheduled preventative maintenance.",
  },
];
