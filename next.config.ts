import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.thibautjuge.com',
      },
    ],
  },
};

export default nextConfig;
