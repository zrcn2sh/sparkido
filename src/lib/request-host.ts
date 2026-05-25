import { headers } from 'next/headers'

/** Next.js 15: headers()는 반드시 await 후 .get() 호출 */
export async function getRequestHost(): Promise<string> {
  const h = await headers()
  return h.get('host') ?? ''
}
