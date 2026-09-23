import type { Metadata } from "next";
import { getCatalogue } from "@/lib/catalogue";
import { QuoteFormFromUrl } from "./QuoteForm";
import { QuotePageFrame } from "./QuotePageFrame";

export const metadata: Metadata = {
  alternates: { canonical: "/quote" },
  title: "Request a quote",
  description:
    "Tell STEM MEDICA what your facility needs and discuss pricing, installation and training requirements.",
};

export const dynamic = "force-static";

export default async function QuotePage() {
  const { products } = await getCatalogue();
  const equipment = products.map((p) => ({
    name: p.name,
    brand: p.brand,
    slug: p.slug,
  }));

  return (
    <QuotePageFrame>
      <QuoteFormFromUrl equipment={equipment} />
    </QuotePageFrame>
  );
}
