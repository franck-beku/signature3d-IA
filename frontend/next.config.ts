import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const backendOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Codebase utilise style={{}} partout (pas de nonces/rendu dynamique) → 'unsafe-inline'
// nécessaire sur script-src/style-src, conformément à l'approche "Without Nonces" documentée
// par Next.js pour next.config.ts (node_modules/next/dist/docs/.../content-security-policy.md).
const buildCsp = (frameAncestors: string) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://teumxzxubxirivjofxqm.supabase.co https://images.unsplash.com",
    "font-src 'self'",
    `connect-src 'self' ${backendOrigin}`,
    // Visites Matterport embarquées (Hero + pages /embed/[slug]).
    "frame-src https://my.matterport.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    "upgrade-insecure-requests",
  ].join("; ");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "teumxzxubxirivjofxqm.supabase.co" },
    ],
  },
  async redirects() {
    return [
      { source: "/comment-ca-marche", destination: "/#comment-ca-marche", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Toutes les routes SAUF /embed/* — le widget doit rester iframable par des sites tiers.
        source: "/((?!embed/|embed$).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy-Report-Only", value: buildCsp("'self'") },
        ],
      },
      {
        // Widget embed — pas de X-Frame-Options, frame-ancestors permissif pour l'iframe cross-site.
        source: "/embed/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy-Report-Only", value: buildCsp("*") },
        ],
      },
    ];
  },
};

export default nextConfig;