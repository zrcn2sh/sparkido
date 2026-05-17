export type D1Database = {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run<T = unknown>(): Promise<D1Result<T>>
  all<T = unknown>(): Promise<D1Result<T>>
}

export type D1Result<T = unknown> = {
  results: T[]
  success: boolean
  meta: Record<string, unknown>
}

export type D1ExecResult = {
  count: number
  duration: number
}

let dbPromise: Promise<D1Database> | null = null

async function connectViaWrangler(): Promise<D1Database> {
  const { getPlatformProxy } = await import('wrangler')
  const { env } = await getPlatformProxy({ configPath: 'wrangler.toml' })
  const db = env.DB as D1Database | undefined
  if (!db) {
    throw new Error('D1 binding "DB" not found. wrangler.toml을 확인하세요.')
  }
  return db
}

/** Cloudflare Pages/Workers 또는 wrangler 로컬 D1 */
export async function getDb(): Promise<D1Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const env = process.env as { DB?: D1Database }
      if (env.DB) return env.DB
      return connectViaWrangler()
    })()
  }
  return dbPromise
}
