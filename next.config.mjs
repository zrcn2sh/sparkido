import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** OpenNext on Workers: /_next/image 최적화 미지원 → public 정적 파일 직접 제공 */
  images: {
    unoptimized: true,
  },
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
    'board.localhost',
    'board.localhost:3000',
    'board.localhost:3001',
    'admin.localhost',
    'admin.localhost:3000',
    'admin.localhost:3001',
    'link.localhost',
    'link.localhost:3000',
    'link.localhost:3001',
    'help.localhost',
    'help.localhost:3000',
    'help.localhost:3001',
  ],
}

export default nextConfig

initOpenNextCloudflareForDev({ configPath: 'wrangler.dev.toml' })
