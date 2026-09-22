import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactBar } from "@/components/ContactBar";
import { Logo } from "@/components/Logo";
import { getCatalogue } from "@/lib/catalogue";

/** Public site chrome. The admin route sits outside this group and gets none of it. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Only categories that actually hold something: a menu entry leading to an
  // empty results page is worse than one fewer entry.
  const { categories, products } = await getCatalogue();
  const menu = categories
    .filter((category) => products.some((product) => product.category === category.slug))
    .map((category) => ({ slug: category.slug, name: category.name }));

  return (
    <div className="public-site">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SiteHeader logo={<Logo height={38} preload />} categories={menu} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
      <ContactBar />
    </div>
  );
}
