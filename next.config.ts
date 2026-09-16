import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve the absolute canonical-host redirect (localhost and 127.0.0.1
  // must not be collapsed into a same-path redirect loop by Proxy).
  skipProxyUrlNormalize: true,
  // Hides the floating dev-route indicator in the corner. Development only; it
  // never shipped to production. Compile and runtime errors are still surfaced.
  devIndicators: false,
};

export default nextConfig;
