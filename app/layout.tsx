import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Red_Hat_Display } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })
const display = Red_Hat_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
})
const inkMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-ink-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mcp-server-studio.vercel.app'),
  title: 'MCP Server Studio - Visual MCP Server Builder',
  description:
    'Build Model Context Protocol servers visually with drag-and-drop tools, real-time testing, and code generation.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${inkMono.variable}`}>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <NuqsAdapter>
          <main id="main-content">{children}</main>
        </NuqsAdapter>
        <SpeedInsights />
      </body>
    </html>
  )
}
