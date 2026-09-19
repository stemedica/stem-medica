export const site = {
  name: "STEM MEDICA",
  legalName: "Stem Medica Import & Distribution",
  tagline: "Putting quality in the front line",
  description:
    "Quality medical supplies, devices and equipment for health facilities across Ethiopia, with installation, training, spare parts and technical support.",
  city: "Addis Ababa, Ethiopia",
  phone: "0921 136 180",
  phoneIntl: "+251921136180",
  secondaryPhone: "0911 272 252",
  secondaryPhoneIntl: "+251911272252",
  email: "info@stemedicaet.com",
  address: "Kal Building, Room 213, in front of Nyala Motors, Bole to Megenagna, Addis Ababa",
  whatsapp: "https://wa.me/251921136180",
  linkedin: "https://www.linkedin.com/company/stem-medica",
  // Used for LocalBusiness structured data. Coordinates come from the Google
  // Maps place embed below.
  geo: { lat: 9.0097216, lng: 38.8039660 },
  streetAddress: "Kal Building, Room 213, in front of Nyala Motors, Bole to Megenagna",
  addressLocality: "Addis Ababa",
  addressCountry: "ET",
  map: {
    // Google Maps place embed. Note the CSP in next.config.ts must allow
    // frame-src https://www.google.com or this renders as a blank box.
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d985.1477695568467!2d38.80396596964416!3d9.009721599440685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b856d14b1869d%3A0x9eb49de4c7b411ca!2sStem%20Medica%20ET!5e0!3m2!1sen!2set!4v1789813810313!5m2!1sen!2set",
    // Opens the native maps app on a phone, which is what most visitors want.
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=9.0097216%2C38.8039660",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.stemedicaet.com",
} as const;

export const nav = [
  { href: "/products", label: "Products" },
  { href: "/service", label: "Service" },
  { href: "/blog", label: "Updates & blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Request a quote", cta: true },
] as const;
