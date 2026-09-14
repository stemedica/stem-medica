import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "onDark";

/* Squared, not pilled. A control on equipment is a rectangle. */
const base =
  "label inline-flex items-center justify-center gap-2.5 rounded-[2px] px-6 py-3.5 font-semibold transition-[background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-scarlet text-white hover:bg-vital",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  onDark: "border border-on-navy/30 text-on-navy hover:border-on-navy hover:bg-on-navy hover:text-navy-deep",
};

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  const external = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  if (external) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return <Link href={href} className={cls}>{children}</Link>;
}
