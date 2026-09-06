import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No database, no external image hosts, no environment variables required.
  // All product images are local files under public/images/.
  // The demo WhatsApp number lives in src/lib/config.ts.
  // No "output" override: Vercel uses its own build output protocol, so the
  // default output is required for a zero-config deployment.
  reactStrictMode: false,
};

export default nextConfig;
