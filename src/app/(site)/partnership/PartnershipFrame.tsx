import { Section } from "@/components/Section";

/**
 * Deliberately not in the main nav: this is the manufacturer front door, not a
 * customer route. It is reached from the Service page and from search, so it
 * stays indexable rather than noindex.
 */
export function PartnershipFrame({ children }: { children: React.ReactNode }) {
  return (
    <Section
      headingLevel="h1"
      title="Become a distribution partner"
      lede="Manufacturers and exporters: tell us what you make and the kind of local partner you need in Ethiopia."
    >
      {children}
    </Section>
  );
}
