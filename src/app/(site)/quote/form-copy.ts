/**
 * Wording for the two enquiry intents.
 *
 * Deliberately a plain module, NOT part of the "use client" form: a server
 * component importing a non-component export from a client module receives a
 * client reference rather than the value, so `copy.partnership` arrived as
 * undefined and the quotation default won. Both sides import it from here.
 */
type Field = {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
};

const person: Field[] = [
  { name: "contact", label: "Your name", placeholder: "Full name", required: true, autoComplete: "name" },
  { name: "phone", label: "Phone number", placeholder: "09… or +251…", required: true, type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email (optional)", placeholder: "name@example.com", type: "email", autoComplete: "email" },
];

/**
 * Both intents share the enquiry pipeline and differ only in wording, so one
 * form serves both rather than a near-duplicate copy drifting out of sync.
 * `kind` is submitted with the form and decides where the visitor is returned.
 */
export const copy = {
  quotation: {
    kind: "quotation",
    fields: [
      { name: "facility", label: "Hospital or organization", placeholder: "Name of hospital, clinic or laboratory", required: true, autoComplete: "organization" },
      ...person,
    ] as Field[],
    mainLabel: "Equipment needed",
    mainPlaceholder: "e.g. neonatal CPAP, patient monitor, mobile X-ray",
    mainInvalid: "Tell us which equipment you need.",
    showQuantity: true,
    notesLabel: "Anything else? (optional)",
    notesPlaceholder: "Department, delivery deadline, site details or questions",
    submit: "Send quotation request",
  },
  partnership: {
    kind: "partnership",
    fields: [
      { name: "facility", label: "Company name", placeholder: "Manufacturer or exporter name", required: true, autoComplete: "organization" },
      ...person,
    ] as Field[],
    mainLabel: "Products you manufacture or export",
    mainPlaceholder: "e.g. patient monitors, infusion pumps, laboratory analysers",
    mainInvalid: "Tell us which products you supply.",
    showQuantity: false,
    notesLabel: "Certifications, territory and terms (optional)",
    notesPlaceholder: "CE/ISO certification, countries you already cover, distributor terms, lead times",
    submit: "Send partnership details",
  },
} as const;

export type FormCopy = (typeof copy)[keyof typeof copy];
