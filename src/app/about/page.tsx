import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "About",
  description:
    "STEM MEDICA is a registered medical equipment importer and distributor in Addis Ababa, founded by biomedical engineer Geremew Zewdie.",
};

/** Labels are real (from public posts); values marked Lorem are placeholder. */
const facts = [
  ["Founded by", "Geremew Zewdie, Biomedical Engineer"],
  ["Based", "Addis Ababa, Ethiopia"],
  ["Team", "11–50 staff"],
  ["Category", "Medical & diagnostic equipment"],
  ["Coverage", "Nationwide delivery"],
];

export default function AboutPage() {
  return (
    <>
      <Section
        index="01"
        label="About"
        title="Founded by an engineer, not a trader"
        lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      >
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="max-w-[65ch] space-y-5 text-[16.5px] leading-relaxed text-ink-soft">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
              dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
              proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
              ab illo inventore veritatis et quasi architecto beatae vitae dicta.
            </p>
          </div>

          <aside className="plate ticks h-fit p-6">
            <div className="label text-steel">At a glance</div>
            <dl className="mt-5 space-y-4">
              {facts.map(([k, v]) => (
                <div key={k} className="border-b border-hair pb-4 last:border-0 last:pb-0">
                  <dt className="label text-steel">{k}</dt>
                  <dd className="mt-1.5 font-mono text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>

      <Section
        tone="dark"
        index="02"
        label="Amharic"
        title="Bilingual, when the copy is ready"
        lede="Amharic here is a placeholder proving the typeface and layout. It should be written by someone on the team, because machine-translated Amharic is obvious to the audience that matters most."
      >
        <p className="font-ethiopic mt-8 max-w-[46ch] text-lg leading-loose text-on-navy/85">
          ሎረም ኢፕሱም ዶሎር ሲት አሜት፣ ኮንሰክቴቱር አዲፒሲንግ ኤሊት፣ ሴድ ዶ ኢዩስሞድ ቴምፖር
          ኢንሲዲዱንት ኡት ላቦሬ ኤት ዶሎሬ ማኛ አሊኳ።
        </p>
      </Section>
    </>
  );
}
