import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "x-vercel-toolbar",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
