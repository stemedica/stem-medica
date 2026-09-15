import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating dev-route indicator in the corner. Development only; it
  // never shipped to production. Compile and runtime errors are still surfaced.
  devIndicators: false,
};

export default nextConfig;
