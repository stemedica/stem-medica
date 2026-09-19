import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuoteForm, copy } from "../../quote/QuoteForm";
import { PartnershipFrame } from "../PartnershipFrame";
import { quoteResultMessage, quoteResults } from "../../quote/quote-result";

export const metadata: Metadata = {
  title: "Become a distribution partner",
  description: "Manufacturers and exporters: tell STEM MEDICA about your medical equipment and the Ethiopian distribution partner you need.",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return quoteResults.map((result) => ({ result }));
}

export default async function PartnershipResultPage({ params }: { params: Promise<{ result: string }> }) {
  const { result } = await params;
  const initialMessage = quoteResultMessage(result);
  if (!initialMessage) notFound();
  return <PartnershipFrame><QuoteForm initialMessage={initialMessage} variant={copy.partnership} /></PartnershipFrame>;
}
