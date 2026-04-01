import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "song-data",
        expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

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

export default withPWA(nextConfig);
