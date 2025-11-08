import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@tsparticles/react'],
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Optimizar carga de CSS
  swcMinify: true,
  compress: true,
  async rewrites() {
    // Reverse proxy
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/api/:path*",
          destination: "https://salesystem-production-0d90.up.railway.app/api/:path*",
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: '/:path*.{js,css,woff,woff2}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
