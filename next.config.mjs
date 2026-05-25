import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clerk/nextjs'],
  allowedDevOrigins: [
    'spark.localhost',
    'spark.localhost:3000',
    'spark.localhost:3001',
  ],
  serverExternalPackages: ['wrangler'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'wrangler']
    }
    return config
  },
}

export default nextConfig

initOpenNextCloudflareForDev({ configPath: 'wrangler.dev.toml' })
