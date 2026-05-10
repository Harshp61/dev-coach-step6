import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dev Coach',
  description: 'Real-time developer coaching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-slate-200">
        {/* Top nav */}
        <header className="border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-accent font-mono text-sm font-medium tracking-widest uppercase">
              DevCoach
            </span>
            <span className="text-border text-xs">|</span>
            <span className="text-muted text-xs font-mono">fintech · internal</span>
          </div>
          <nav className="flex items-center gap-6 text-xs text-muted">
            <a href="/" className="hover:text-slate-200 transition-colors">My View</a>
            <a href="/manager" className="hover:text-slate-200 transition-colors">Manager View</a>
          </nav>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
