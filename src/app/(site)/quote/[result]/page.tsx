import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuoteForm } from "../QuoteForm";
import { QuotePageFrame } from "../QuotePageFrame";
import { quoteResultMessage, quoteResults } from "../quote-result";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Tell STEM MEDICA what your facility needs and discuss pricing, installation and training requirements.",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return quoteResults.map((result) => ({ result }));
}

export default async function QuoteResultPage({ params }: { params: Promise<{ result: string }> }) {
  const { result } = await params;
  const initialMessage = quoteResultMessage(result);
  if (!initialMessage) notFound();
  return <QuotePageFrame><QuoteForm initialMessage={initialMessage} /></QuotePageFrame>;
}
