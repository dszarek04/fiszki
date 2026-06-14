import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Produce a self-contained build for Docker (copies node_modules, etc.)
  output: 'standalone',

  // Allow portless CA cert when running via portless proxy
  experimental: {
    // Next.js 16 — no extra flags required for App Router
  },
};

export default nextConfig;
