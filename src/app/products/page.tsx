import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/content/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Medical equipment catalogue. Systems supplied, installed and supported across Ethiopia.",
};

export default function ProductsPage() {
  return (
    <Section
      index="01"
      label="Full catalogue"
      meta={`${String(products.length).padStart(2, "0")} systems`}
      title="All equipment"
      lede="Device names and brands are real. Specifications, availability and lead times are placeholder until the product list arrives."
    >
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </Section>
  );
}
