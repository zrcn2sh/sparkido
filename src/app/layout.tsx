export const runtime = 'edge'

import { AppProviders } from '@/components/providers/AppProviders'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Idosquare',
    template: '%s | Idosquare',
  },
  description:
    '아이디어는 누구나 가질 수 있지만, 실행의 궤적은 당신만의 것입니다',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={cn('font-sans', inter.variable)}>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased',
          inter.className,
        )}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
