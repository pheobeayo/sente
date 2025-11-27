import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure image domains if using external images
  images: {
    domains: ['placeholder.com'], // Add any external image domains here
    unoptimized: true, // For static export if needed
  },

  // Add headers to handle CORS for API requests
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Add rewrites to proxy API requests and avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/stacks/:path*',
        destination: 'https://api.testnet.hiro.so/:path*',
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes for various packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_STACKS_API_URL: process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so',
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST2685JDP18T2355FS34JER4D8MG3Y74XKA7PDQHJ',
    NEXT_PUBLIC_CONTRACT_NAME: process.env.NEXT_PUBLIC_CONTRACT_NAME || 'token-dex',
    NEXT_PUBLIC_EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.hiro.so',
  },
};

export default nextConfig;