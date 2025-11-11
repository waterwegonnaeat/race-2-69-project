import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'
import { cn } from '@/lib/utils'
import { Trophy, BarChart3, Medal, Sparkles } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'R69W Analytics | Race to 69 & Win',
  description: 'Team-focused NCAA basketball analytics tracking the Race to 69 phenomenon',
  keywords: ['NCAA basketball', 'R69W', 'basketball analytics', 'sports statistics', 'team stats'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'min-h-screen bg-background')}>
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            {/* Main Content - No top padding */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
