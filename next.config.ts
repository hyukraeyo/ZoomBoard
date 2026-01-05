import type { NextConfig } from "next";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

import withPWAInit from "@ducanh2912/next-pwa";

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 3, 8. Bundle optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "@tiptap/react", "@tiptap/starter-kit"],
  },
  // 8. Performance & UI consistency
  bundlePagesRouterDependencies: true,
  poweredByHeader: false,
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withBundleAnalyzer(withPWA(nextConfig));
