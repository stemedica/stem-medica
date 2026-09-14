import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Tell STEM MEDICA what your facility needs and get a quotation, including installation and training.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;

  return (
    <Section
      index="01"
      label="Request a quote"
      meta="Same-day reply"
      title="Tell us what your facility needs"
      lede="Quotations include installation and training. Proforma invoices for procurement and tender submission are issued on request."
    >
      <QuoteForm presetItem={item ?? ""} />
    </Section>
  );
}
