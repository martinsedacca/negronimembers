import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Include wallet template files in serverless functions
  outputFileTracingIncludes: {
    '/api/wallet/apple/[memberId]': ['./wallet-templates/**/*'],
    '/api/v1/passes/[passTypeIdentifier]/[serialNumber]': ['./wallet-templates/**/*'],
  },
};

export default nextConfig;
