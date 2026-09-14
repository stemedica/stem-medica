export const site = {
  name: "STEM MEDICA",
  legalName: "Stem Medica Import & Distribution",
  tagline: "Putting quality in the front line",
  description:
    "Medical equipment for Ethiopian hospitals: supplied, installed and supported by biomedical engineers. Cardiac, imaging, critical care, neonatal and laboratory systems.",
  city: "Addis Ababa, Ethiopia",
  phone: "0921 136 180",
  phoneIntl: "+251921136180",
  email: "info@stemedicaet.com",
  whatsapp: "https://wa.me/251921136180",
  linkedin: "https://www.linkedin.com/company/stem-medica",
  url: "https://stemedicaet.com",
} as const;

export const nav = [
  { href: "/products", label: "Products" },
  { href: "/service", label: "Service" },
  { href: "/blog", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Request a quote", cta: true },
] as const;
