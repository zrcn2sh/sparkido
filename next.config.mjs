/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clerk/nextjs'],
  allowedDevOrigins: [
    'spark.localhost',
    'spark.localhost:3000',
    'spark.localhost:3001',
  ],
  experimental: {
    serverComponentsExternalPackages: ['wrangler'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'wrangler']
    }
    return config
  },
}

export default nextConfig
