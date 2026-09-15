import type { ReactNode } from "react";

/**
 * Inert stand-in for a Button, used on the /v1 and /v2 design comparisons.
 * These pages exist to be looked at, so nothing navigates.
 */
const base =
  "label inline-flex items-center justify-center gap-2 rounded-[2px] px-6 py-3.5 font-semibold demo-inert select-none";

const variants = {
  primary: "bg-scarlet text-white",
  outline: "border border-ink text-ink",
  onDark: "border border-on-navy/30 text-on-navy",
} as const;

export function DemoButton({
  variant = "primary",
  children,
  className = "",
}: {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span role="button" aria-disabled="true" className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
