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
  searchParams: Promise<{ item?: string | string[]; sent?: string | string[]; error?: string | string[] }>;
}) {
  const { item, sent, error } = await searchParams;
  const initialMessage = sent === "1"
    ? "Thanks — your request is saved. Our team will contact you using the details you provided."
    : error === "limit"
      ? "Too many requests were sent from this connection. Please call or try again in one hour."
      : error
        ? "We couldn’t save your request. Check the details, then try again or call us."
        : "";

  return (
    <Section
      headingLevel="h1"
      title="Tell us what your facility needs"
      lede="Tell us what you need, how many and where they should be delivered. We’ll reply with pricing and the next steps for installation or training."
    >
      <QuoteForm key={`${typeof item === "string" ? item : ""}-${initialMessage}`} presetItem={typeof item === "string" ? item.slice(0, 500) : ""} initialMessage={initialMessage} />
    </Section>
  );
}
