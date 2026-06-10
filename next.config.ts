import type { NextConfig } from "next";

// Enforced Content-Security-Policy (sent as Content-Security-Policy, not -Report-Only).
// Next.js' inline bootstrap/hydration scripts still need 'unsafe-inline'; 'unsafe-eval'
// is not required in a production build so it is omitted. Next step toward a strict
// policy: switch script-src to a per-request nonce and drop 'unsafe-inline'.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

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
          { key: "x-vercel-toolbar", value: "0" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
