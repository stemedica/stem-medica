import type { Metadata } from "next";
import { QuoteFormFromUrl, copy } from "../quote/QuoteForm";
import { PartnershipFrame } from "./PartnershipFrame";

export const metadata: Metadata = {
  alternates: { canonical: "/partnership" },
  title: "Become a distribution partner",
  description:
    "Manufacturers and exporters: tell STEM MEDICA about your medical equipment and the Ethiopian distribution partner you need.",
};

export const dynamic = "force-static";

export default function PartnershipPage() {
  return (
    <PartnershipFrame>
      <QuoteFormFromUrl variant={copy.partnership} />
    </PartnershipFrame>
  );
}
