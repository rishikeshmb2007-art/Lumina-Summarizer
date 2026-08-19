import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js 16 you're aware of Turbopack defaults
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;