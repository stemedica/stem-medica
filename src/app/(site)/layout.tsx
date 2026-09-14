import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactBar } from "@/components/ContactBar";
import { Logo } from "@/components/Logo";

/** Public site chrome. The admin route sits outside this group and gets none of it. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader logo={<Logo height={38} />} />
      <main>{children}</main>
      <SiteFooter />
      <ContactBar />
    </>
  );
}
