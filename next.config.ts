import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'api.ts', 'api.tsx'],
  devIndicators: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

export default nextConfig;
