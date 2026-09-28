import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Noto_Sans_Ethiopic, Playfair_Display, Syne } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";

/* One variable family across the width axis does the work of a pairing. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
  // Labels are supporting UI, not primary content. Let the browser request only
  // the weights a page actually uses instead of preloading all three up front.
  preload: false,
});
const ethiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "600"],
  variable: "--font-ethiopic-face",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "stemedica",
    "stemedica et",
    "stemedica ethiopia",
    "stem medica",
    "stem medica ethiopia",
    "medical sales in ethiopia",
    "medical sales ethiopia",
    "medical equipment sales ethiopia",
    "medical supplies sales addis ababa",
    "hospital equipment distributor ethiopia",
    "biomedical engineering ethiopia",
    "diagnostic equipment addis ababa",
    "laboratory equipment ethiopia",
    "ultrasound machine ethiopia",
    "patient monitor addis ababa",
    "stem medica import & distribution",
  ],
  authors: [{ name: "STEM MEDICA", url: site.url }],
  creator: "STEM MEDICA",
  publisher: "STEM MEDICA",
  category: "Medical Sales & Healthcare Technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_ET",
    url: site.url,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}: medical equipment and supplies in Ethiopia` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${archivo.variable} ${plexMono.variable} ${ethiopic.variable} ${playfair.variable} ${syne.variable}`}>
      <body className="antialiased">
        {children}
        <OrganizationSchema />
        <WebSiteSchema />
      </body>
    </html>
  );
}
