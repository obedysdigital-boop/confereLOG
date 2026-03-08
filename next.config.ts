import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel
  // output: "standalone",
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  // Optimize for Vercel deployment
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  
  // Ensure dynamic routes work correctly
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
