import { site } from "@/lib/site";

/**
 * JSON-LD for search engines.
 *
 * MedicalBusiness rather than plain Organization: it is the closest schema.org
 * type for a medical equipment supplier, and it lets Google associate the
 * address, phones and geo with the business for local results, which is where
 * "medical equipment supplier Addis Ababa" traffic comes from.
 *
 * The data here must match the Google Business Profile exactly, or the two
 * disagree and Google trusts neither.
 */
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    alternateName: [
      "Stemedica",
      "Stemedica ET",
      "STEM MEDICA Ethiopia",
      "Stemedica Ethiopia",
      "Stem Medica Import & Distribution",
    ],
    slogan: site.tagline,
    url: site.url,
    logo: `${site.url}/logo.png`,
    image: `${site.url}/og.png`,
    description: site.description,
    telephone: site.phoneIntl,
    email: site.email,
    priceRange: "$$$",
    hasMap: site.map.directions,
    currenciesAccepted: "ETB, USD",
    paymentAccepted: "Cash, Bank Transfer, Letter of Credit",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      addressCountry: site.addressCountry,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:30",
        closes: "17:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:30",
        closes: "12:30",
      },
    ],
    areaServed: { "@type": "Country", name: "Ethiopia" },
    sameAs: [site.linkedin],
    knowsAbout: [
      "Medical Devices",
      "Hospital Equipment",
      "Biomedical Engineering",
      "Diagnostic Ultrasound",
      "Patient Monitors",
      "Clinical Laboratory Equipment",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phoneIntl,
        contactType: "customer service",
        areaServed: "ET",
        availableLanguage: ["en", "am"],
      },
    ],
  };
  return <Script data={data} />;
}

export function WebSiteSchema() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        alternateName: ["Stemedica", "Stemedica ET", "STEM MEDICA Ethiopia"],
        publisher: { "@id": `${site.url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.url}/products?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  date,
  author,
  image,
  slug,
}: {
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  slug: string;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        datePublished: `${date}T12:00:00Z`,
        dateModified: `${date}T12:00:00Z`,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@id": `${site.url}/#organization`,
        },
        ...(image ? { image: `${site.url}${image}` } : {}),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${site.url}/blog/${slug}`,
        },
      }}
    />
  );
}

export function BreadcrumbSchema({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${site.url}${item.path}`,
        })),
      }}
    />
  );
}

export function ProductSchema({
  name, description, image, brand, slug,
}: {
  name: string; description: string; image?: string; brand?: string; slug: string;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        ...(image ? { image: `${site.url}${image}` } : {}),
        ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
        url: `${site.url}/products/${slug}`,
        // No price: quotations are manual, so an Offer with a made-up price
        // would be a lie Google can penalise.
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "ETB",
          url: `${site.url}/products/${slug}`,
          seller: { "@id": `${site.url}/#organization` },
        },
      }}
    />
  );
}

function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from typed data; < is escaped to prevent script breakout (XSS).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
