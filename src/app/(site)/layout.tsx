import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactBar } from "@/components/ContactBar";
import { Logo } from "@/components/Logo";

/** Public site chrome. The admin route sits outside this group and gets none of it. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SiteHeader logo={<Logo height={38} />} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
      <ContactBar />
    </div>
  );
}
