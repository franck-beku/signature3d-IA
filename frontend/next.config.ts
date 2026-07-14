import type { NextConfig } from "next";

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
};

export default nextConfig;