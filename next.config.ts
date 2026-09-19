import type { NextConfig } from "next";

const scripts = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Hides the floating dev-route indicator in the corner. Development only; it
  // never shipped to production. Compile and runtime errors are still surfaced.
  devIndicators: false,
  async redirects() {
    return [{
      source: "/",
      has: [{ type: "host", value: "admin\\..+" }],
      destination: "/admin",
      permanent: false,
    }];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src https://www.google.com; object-src 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; ${scripts}; connect-src 'self'; upgrade-insecure-requests` },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      ],
    }];
  },
};

export default nextConfig;
