import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't fail build on ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Don't fail build on TypeScript errors (we still want type checking in dev)
  typescript: {
    ignoreBuildErrors: false, // Keep type checking, but don't fail on warnings
  },
};

export default nextConfig;
