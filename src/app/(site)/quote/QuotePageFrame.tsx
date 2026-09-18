import type { ReactNode } from "react";
import { Section } from "@/components/Section";

export function QuotePageFrame({ children }: { children: ReactNode }) {
  return (
    <Section
      headingLevel="h1"
      title="Tell us what your facility needs"
      lede="Tell us what you need, how many and where it should be delivered. We’ll reply with pricing and the next steps for installation or training."
    >
      {children}
    </Section>
  );
}
