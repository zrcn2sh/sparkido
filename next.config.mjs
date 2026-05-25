import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clerk/nextjs'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs'],
  },
  allowedDevOrigins: [
    'spark.localhost',
    'spark.localhost:3000',
    'spark.localhost:3001',
    'info.localhost',
    'info.localhost:3000',
    'info.localhost:3001',
    'www.localhost',
    'www.localhost:3000',
    'www.localhost:3001',
  ],
}

export default nextConfig

initOpenNextCloudflareForDev({ configPath: 'wrangler.dev.toml' })
