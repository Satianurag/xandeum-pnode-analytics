import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 PERFORMANCE OPTIMIZATIONS (2025 Best Practices)
  // ═══════════════════════════════════════════════════════════════════════════

  // Enable TypeScript type checking in production
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize images for production (AVIF first for best compression)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  outputFileTracingRoot: path.resolve(__dirname),

  // Production-ready security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {},

  // React Compiler - automatic memoization, 12% faster loads (Meta benchmarks)
  // Eliminates need for useMemo, useCallback, React.memo in most cases
  reactCompiler: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 EXPERIMENTAL FEATURES (Next.js 16 / React 19)
  // ═══════════════════════════════════════════════════════════════════════════
  experimental: {
    // CSS optimization - reduces render-blocking CSS
    optimizeCss: false,

    // View Transitions API - GPU-accelerated page transitions
    // Provides native app-like navigation experience
    viewTransition: false,
  },

  // Webpack fallback for production (client-side polyfills)
  webpack: (config, { isServer }) => {
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
}

export default nextConfig
