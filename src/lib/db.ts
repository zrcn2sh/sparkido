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

/** Cloudflare D1 — Workers·next dev 모두 getCloudflareContext (wrangler CLI 번들 제외) */
export async function getDb(): Promise<D1Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare')
      const { env } = await getCloudflareContext({ async: true })
      const db = env.DB
      if (!db) {
        throw new Error(
          'D1 binding "DB" not found. wrangler.toml, Dashboard 바인딩, initOpenNextCloudflareForDev를 확인하세요.',
        )
      }
      return db
    })()
  }
  return dbPromise
}
