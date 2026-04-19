import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["10.109.86.53:3000", "localhost:3000"]
    }
  },
  allowedDevOrigins: ["10.109.86.53", "10.109.86.53:3000", "localhost", "localhost:3000"]
};

export default nextConfig;
