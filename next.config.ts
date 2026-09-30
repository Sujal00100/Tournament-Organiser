import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow Server Actions from any origin during local development.
      // This is required when accessing via network IP (e.g. 26.186.149.180:3000)
      // instead of localhost, so Next.js CSRF origin check doesn't block form submissions.
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "26.186.149.180:3000",
      ],
    },
  },
};

export default nextConfig;
