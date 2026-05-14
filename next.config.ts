import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: {
    position: "top-right",
  },
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
