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
    url: site.url,
    logo: `${site.url}/logo.png`,
    image: `${site.url}/og.png`,
    description: site.description,
    telephone: site.phoneIntl,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      addressCountry: site.addressCountry,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: { "@type": "Country", name: "Ethiopia" },
    sameAs: [site.linkedin],
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
        publisher: { "@id": `${site.url}/#organization` },
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
