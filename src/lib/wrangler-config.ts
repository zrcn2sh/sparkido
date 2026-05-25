/** 로컬 `next dev`에서는 .open-next/worker.js 없이 D1만 쓰는 wrangler.dev.toml */
export function getWranglerConfigPath(): string {
  return process.env.NODE_ENV === 'development'
    ? 'wrangler.dev.toml'
    : 'wrangler.toml'
}
