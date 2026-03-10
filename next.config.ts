import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Configuração para API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  } as any,
};

export default nextConfig;
