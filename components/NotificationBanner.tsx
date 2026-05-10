'use client'

import { useEffect, useState } from 'react'
import { Insight } from '@/lib/types'
import { explainInsight } from '@/lib/insights'

interface NotificationBannerProps {
  insight: Insight | null
}

const severityConfig = {
  high: {
    bar: 'bg-red-500',
    icon: '⚡',
    label: 'Action needed',
    bg: 'bg-[#1a1118] border-red-500/25',
    text: 'text-red-400',
    progress: 'bg-red-500',
  },
  medium: {
    bar: 'bg-amber-500',
    icon: '◆',
    label: 'Heads up',
    bg: 'bg-[#181510] border-amber-500/25',
    text: 'text-amber-400',
    progress: 'bg-amber-500',
  },
  low: {
    bar: 'bg-blue-500',
    icon: '○',
    label: 'Tip',
    bg: 'bg-[#0f1420] border-blue-500/25',
    text: 'text-blue-400',
    progress: 'bg-blue-500',
  },
}

const DISMISS_AFTER = 5000

export default function NotificationBanner({ insight }: NotificationBannerProps) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!insight || dismissed) return

    // Small delay so it animates in after page load
    const showTimer = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(showTimer)
  }, [insight, dismissed])

  useEffect(() => {
    if (!visible || dismissed) return

    // Progress bar countdown
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / DISMISS_AFTER) * 100)
      setProgress(remaining)
      if (remaining === 0) clearInterval(interval)
    }, 50)

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setDismissed(true), 400)
    }, DISMISS_AFTER)

    return () => {
      clearInterval(interval)
      clearTimeout(dismissTimer)
    }
  }, [visible, dismissed])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => setDismissed(true), 400)
  }

  if (!insight || dismissed) return null

  const cfg = severityConfig[insight.severity]
  const details = explainInsight(insight)

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-full max-w-lg mx-auto
        transition-all duration-400 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}
      `}
    >
      <div className={`
        relative overflow-hidden
        border rounded-xl shadow-2xl shadow-black/60
        px-4 py-3.5
        ${cfg.bg}
      `}>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full">
          <div
            className={`h-full transition-none ${cfg.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`shrink-0 text-sm mt-0.5 ${cfg.text}`}>{cfg.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${cfg.text}`}>
              {cfg.label}
            </div>
            <p className="text-sm text-slate-200 leading-snug">{insight.message}</p>
            <p className="text-xs text-slate-400 mt-1.5 leading-snug">{details.fixSteps[0]}</p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
