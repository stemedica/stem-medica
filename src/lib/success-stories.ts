/**
 * Homepage story cards.
 *
 * These describe the kinds of work STEM MEDICA does, drawn from the service
 * page and the real catalogue categories. They name no facility and claim no
 * completed project, because none have been supplied.
 *
 * To turn these into genuine success stories, replace each entry with a real
 * one — facility, town, what was supplied and installed — and add `image`
 * with a photo uploaded through the admin. The card renders a marked
 * placeholder until an image is set, so entries can be filled in one at a time.
 */
export type SuccessStory = {
  /** Short title for the work. */
  title: string;
  /** Where this kind of work happens. A town or region once real. */
  place: string;
  summary: string;
  /** Media id from the admin uploader. Omit for the placeholder panel. */
  image?: string;
};

export const successStories: SuccessStory[] = [
  {
    title: "Wards, theatres and intensive care",
    place: "Hospitals",
    summary: "Patient monitors, defibrillators, electrosurgical units and ICU beds, delivered and commissioned on site with the team who will use them.",
  },
  {
    title: "Diagnostic imaging rooms",
    place: "Hospitals and clinics",
    summary: "Mobile digital X-ray and ECG equipment, installed and handed over with training so a room can start seeing patients.",
  },
  {
    title: "Laboratory fit-out",
    place: "Laboratories",
    summary: "Blood gas and electrolyte analysers, with the consumables and accessories kept flowing after the equipment is in place.",
  },
  {
    title: "Emergency and ambulance readiness",
    place: "Emergency departments",
    summary: "Defibrillators with monitoring, emergency equipment and wound care supplies for departments and vehicles that cannot wait.",
  },
  {
    title: "Dental clinic equipping",
    place: "Dental clinics",
    summary: "Chair units and supporting equipment, installed and backed by spare parts and technical support once the clinic is open.",
  },
];
