import type { Metadata } from "next";
import { QuoteFormFromUrl } from "./QuoteForm";
import { QuotePageFrame } from "./QuotePageFrame";

export const metadata: Metadata = {
  alternates: { canonical: "/quote" },
  title: "Request a quote",
  description:
    "Tell STEM MEDICA what your facility needs and discuss pricing, installation and training requirements.",
};

export const dynamic = "force-static";

export default function QuotePage() {
  return (
    <QuotePageFrame>
      <QuoteFormFromUrl />
    </QuotePageFrame>
  );
}
