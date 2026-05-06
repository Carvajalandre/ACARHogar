import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure build doesn't fail on TS errors during Vercel deploys
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
