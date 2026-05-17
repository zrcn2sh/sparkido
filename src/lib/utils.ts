import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl(subdomain: 'www' | 'spark') {
  if (subdomain === 'spark') {
    return process.env.NEXT_PUBLIC_SPARK_URL ?? 'http://spark.localhost:3000'
  }
  return process.env.NEXT_PUBLIC_WWW_URL ?? 'http://localhost:3000'
}
