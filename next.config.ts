import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode: enforce ESLint and TypeScript checks during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
