import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proforma builder",
  // Belt and braces alongside the auth gate in proxy.ts.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
