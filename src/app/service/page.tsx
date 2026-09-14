import type { Metadata } from "next";
import { Search, FileText, Truck, GraduationCap, ShieldCheck, Headset } from "lucide-react";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service & Support",
  description:
    "How STEM MEDICA supports equipment after delivery: site survey, installation, commissioning, user training, spares and warranty.",
};

/** Stage names are structural; the descriptions are LOREM placeholder. */
const stages = [
  { n: "01", icon: Search, title: "Site survey", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { n: "02", icon: FileText, title: "Quotation & proforma", body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
  { n: "03", icon: Truck, title: "Delivery & installation", body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  { n: "04", icon: GraduationCap, title: "User training", body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { n: "05", icon: ShieldCheck, title: "Warranty & spares", body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem." },
  { n: "06", icon: Headset, title: "Ongoing support", body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni." },
];

export default function ServicePage() {
  return (
    <>
      <Section
        index="01"
        label="Service & support"
        meta="06 stages"
        title="What happens after the purchase order"
        lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      >
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map(({ n, icon: Icon, title, body }) => (
            <li key={n} className="plate plate-hover lift relative p-6">
              <span className="stamp absolute right-5 top-5 text-3xl text-navy/10">
                {n}
              </span>
              <span className="flex h-11 w-11 items-center justify-center border border-hair bg-paper text-navy">
                <Icon size={21} aria-hidden="true" />
              </span>
              <h2 className="font-display wdth-n mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        tone="dark"
        index="02"
        label="For manufacturers"
        title="Looking for Ethiopian distribution?"
        lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href={`mailto:${site.email}`}>Email {site.email}</Button>
          <Button href={site.linkedin} variant="onDark">LinkedIn</Button>
        </div>
      </Section>
    </>
  );
}
