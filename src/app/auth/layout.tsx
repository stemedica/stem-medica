import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-paper px-5 py-12 sm:py-20"><div className="mx-auto max-w-md"><p className="label mb-4 text-navy">STEM MEDICA · Private admin</p><div className="rounded-2xl border border-hair bg-white p-6 sm:p-8">{children}</div><p className="mt-5 text-sm text-steel">Access is restricted to approved administrators. Never share your password.</p></div></main>;
}
