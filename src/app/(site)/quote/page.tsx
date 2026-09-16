import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Tell STEM MEDICA what your facility needs and discuss pricing, installation and training requirements.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string | string[] }>;
}) {
  const { item } = await searchParams;

  return (
    <Section
      headingLevel="h1"
      index="01"
      label="Request a quote"
      meta="Equipment enquiry"
      title="Tell us what your facility needs"
      lede="Tell us the equipment, quantity and delivery location you need. Our team will confirm pricing and any installation or training requirements in your quotation."
    >
      <QuoteForm key={typeof item === "string" ? item : ""} presetItem={typeof item === "string" ? item.slice(0, 500) : ""} />
    </Section>
  );
}
