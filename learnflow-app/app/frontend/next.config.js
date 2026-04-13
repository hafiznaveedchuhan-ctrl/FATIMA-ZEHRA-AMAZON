/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'fakestoreapi.com' },
      { protocol: 'https', hostname: 'dummyjson.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? 'http://localhost:8001',
    NEXT_PUBLIC_PRODUCT_SERVICE_URL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ?? 'http://localhost:8002',
    NEXT_PUBLIC_ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? 'http://localhost:8003',
    NEXT_PUBLIC_CHAT_SERVICE_URL: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL ?? 'http://localhost:8004',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Fatima Zehra Amazon Shop',
  },
}

module.exports = nextConfig
