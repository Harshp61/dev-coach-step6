'use client'

import { useEffect, useRef, useState } from 'react'
import { Engineer, ImplementableFix, Insight } from '@/lib/types'
import { explainInsight } from '@/lib/insights'
import { getImplementableFix } from '@/lib/fixes'
import CoachAvatar, { AvatarMood } from './CoachAvatar'

interface CoachOverlayProps {
  insights: Insight[]
  engineer: Engineer
  selectedInsightIndex: number | null
  onSelectInsight: (index: number | null) => void
  onApplyFix: (fix: ImplementableFix) => void
}

const severityConfig = {
  high: { dot: 'bg-red-400', label: 'Critical', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { dot: 'bg-amber-400', label: 'Improve', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { dot: 'bg-blue-400', label: 'Tip', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
}

const QUICK_PROMPTS = [
  { id: 'focus', label: 'What should I fix first?' },
  { id: 'why', label: 'Why does this matter?' },
  { id: 'apply', label: 'Show implementable fix' },
]

export default function CoachOverlay({
  insights,
  engineer,
  selectedInsightIndex,
  onSelectInsight,
  onApplyFix,
}: CoachOverlayProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 24, y: 24 })
  const [dragging, setDragging] = useState(false)
  const [didDrag, setDidDrag] = useState(false)
  const [chatLines, setChatLines] = useState<{ role: 'coach' | 'user'; text: string }[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const pointerStart = useRef({ x: 0, y: 0 })

  const highCount = insights.filter((i) => i.severity === 'high').length
  const hasCritical = highCount > 0
  const selectedInsight = selectedInsightIndex !== null ? insights[selectedInsightIndex] : null
  const selectedFix =
    selectedInsight && selectedInsightIndex !== null
      ? getImplementableFix(selectedInsight, selectedInsightIndex)
      : null

  const mood: AvatarMood = copiedId
    ? 'success'
    : open && selectedInsight
      ? 'speaking'
      : hasCritical
        ? 'alert'
        : 'idle'

  useEffect(() => {
    setPosition({
      x: window.innerWidth - 88,
      y: window.innerHeight - 120,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const first = engineer.name.split(' ')[0]
    const greeting =
      insights.length === 0
        ? `Hey ${first} — you're clear today. Want a stretch goal?`
        : hasCritical
          ? `I've got ${insights.length} signals — ${highCount} need attention before your next PR.`
          : `I spotted ${insights.length} ways to tighten your delivery this sprint.`
    setChatLines([{ role: 'coach', text: greeting }])
  }, [open, insights.length, hasCritical, highCount, engineer.name])

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    setDidDrag(false)
    pointerStart.current = { x: e.clientX, y: e.clientY }
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.hypot(dx, dy) > 4) setDidDrag(true)

    const pad = 16
    const maxX = window.innerWidth - 72 - pad
    const maxY = window.innerHeight - 72 - pad
    setPosition({
      x: Math.min(maxX, Math.max(pad, e.clientX - dragOffset.current.x)),
      y: Math.min(maxY, Math.max(pad, e.clientY - dragOffset.current.y)),
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const handleQuickPrompt = (id: string) => {
    const prompt = QUICK_PROMPTS.find((p) => p.id === id)
    if (!prompt || !selectedInsight) return
    setChatLines((prev) => [
      ...prev,
      { role: 'user', text: prompt.label },
      {
        role: 'coach',
        text:
          id === 'focus'
            ? selectedInsight.action
            : id === 'why'
              ? selectedInsight.why
              : `Here's a ready-to-use fix for "${selectedFix?.title}":`,
      },
    ])
  }

  const handleCopy = async (fix: ImplementableFix) => {
    await navigator.clipboard.writeText(fix.content)
    setCopiedId(fix.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const panelRight = Math.max(16, window.innerWidth - position.x - 400)
  const panelBottom = Math.max(16, window.innerHeight - position.y - 16)

  return (
    <>
      {!open && hasCritical && (
        <div
          className="fixed z-[60] max-w-[220px] pointer-events-none"
          style={{ left: Math.max(16, position.x - 210), top: position.y - 4 }}
        >
          <CoachSpeechBubble message={insights[0]?.message ?? ''} />
        </div>
      )}

      <div
        className="fixed z-[70] touch-none select-none"
        style={{ left: position.x, top: position.y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {!open && insights.length > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-mono font-bold shadow-lg">
            {insights.length}
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            if (!didDrag) setOpen((o) => !o)
          }}
          className={`block transition-transform ${dragging ? 'scale-105 cursor-grabbing' : 'cursor-grab hover:scale-105'}`}
          aria-label={open ? 'Close coach' : 'Open coach'}
          aria-expanded={open}
        >
          <CoachAvatar mood={mood} pulsing={hasCritical && !open} />
        </button>
      </div>

      <CoachPanel
        open={open}
        style={{ right: panelRight, bottom: panelBottom }}
        insights={insights}
        engineer={engineer}
        hasCritical={hasCritical}
        highCount={highCount}
        selectedInsightIndex={selectedInsightIndex}
        onSelectInsight={onSelectInsight}
        selectedInsight={selectedInsight}
        selectedFix={selectedFix}
        chatLines={chatLines}
        onQuickPrompt={handleQuickPrompt}
        onApplyFix={onApplyFix}
        onCopy={handleCopy}
        copiedId={copiedId}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

function CoachSpeechBubble({ message }: { message: string }) {
  return (
    <>
      <div className="bg-[#161b27] border border-red-500/30 rounded-xl px-3 py-2 text-xs text-slate-200 shadow-lg">
        <span className="text-red-400 font-mono text-[10px] uppercase">Coach</span>
        <p className="mt-1 leading-snug">{message}</p>
      </div>
      <div
        className="absolute -right-1 bottom-3 w-3 h-3 bg-[#161b27] border-r border-b border-red-500/30 rotate-[-45deg]"
        aria-hidden
      />
    </>
  )
}

function CoachPanel({
  open,
  style,
  insights,
  engineer,
  hasCritical,
  highCount,
  selectedInsightIndex,
  onSelectInsight,
  selectedInsight,
  selectedFix,
  chatLines,
  onQuickPrompt,
  onApplyFix,
  onCopy,
  copiedId,
  onClose,
}: {
  open: boolean
  style: { right: number; bottom: number }
  insights: Insight[]
  engineer: Engineer
  hasCritical: boolean
  highCount: number
  selectedInsightIndex: number | null
  onSelectInsight: (index: number | null) => void
  selectedInsight: Insight | null
  selectedFix: ImplementableFix | null
  chatLines: { role: 'coach' | 'user'; text: string }[]
  onQuickPrompt: (id: string) => void
  onApplyFix: (fix: ImplementableFix) => void
  onCopy: (fix: ImplementableFix) => void
  copiedId: string | null
  onClose: () => void
}) {
  return (
    <div
      data-coach-panel
      className={`
        fixed z-[65] w-[400px] max-h-[min(72vh,560px)]
        flex flex-col
        bg-[#161b27] border border-[#1e2535] rounded-2xl shadow-2xl shadow-black/60
        transition-all duration-300 ease-out origin-bottom-right
        ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
      style={style}
    >
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1e2535] shrink-0">
        <CoachPanelHeader hasCritical={hasCritical} highCount={highCount} />
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1" aria-label="Close">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="px-4 py-3 border-b border-[#1e2535] max-h-28 overflow-y-auto space-y-2 shrink-0">
        {chatLines.map((line, i) => (
          <div
            key={i}
            className={`text-xs leading-relaxed rounded-lg px-2.5 py-2 ${
              line.role === 'coach'
                ? 'bg-blue-500/10 text-slate-200 border border-blue-500/15'
                : 'bg-white/5 text-slate-400 ml-6'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="overflow-y-auto flex-1 px-3 py-2 space-y-1.5 min-h-0">
        {insights.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No issues detected — great work today.</p>
        ) : (
          insights.map((insight, i) => {
            const cfg = severityConfig[insight.severity]
            const isSelected = selectedInsightIndex === i
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectInsight(isSelected ? null : i)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${
                  isSelected
                    ? 'bg-[#0f1117] border-blue-500/40'
                    : 'bg-[#0f1117]/60 border-[#1e2535] hover:border-[#2a3347]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  {isSelected && <span className="text-[10px] text-blue-400 ml-auto">selected</span>}
                </div>
                <p className="text-sm text-slate-200 leading-snug">{insight.message}</p>
              </button>
            )
          })
        )}
      </div>

      {selectedInsight && selectedFix && (
        <FixSection
          insight={selectedInsight}
          fix={selectedFix}
          onQuickPrompt={onQuickPrompt}
          onApplyFix={onApplyFix}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      )}

      <footer className="px-4 py-2.5 border-t border-[#1e2535] text-[10px] font-mono text-slate-600 shrink-0">
        Drag avatar anywhere · L{engineer.maturityLevel} → L{Math.min(engineer.maturityLevel + 1, 5)}
      </footer>
    </div>
  )
}

function CoachPanelHeader({
  hasCritical,
  highCount,
}: {
  hasCritical: boolean
  highCount: number
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.15em]">DevCoach</span>
        {hasCritical && (
          <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
            {highCount} critical
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-100 mt-0.5">Interactive coach</h3>
    </div>
  )
}

function FixSection({
  insight,
  fix,
  onQuickPrompt,
  onApplyFix,
  onCopy,
  copiedId,
}: {
  insight: Insight
  fix: ImplementableFix
  onQuickPrompt: (id: string) => void
  onApplyFix: (fix: ImplementableFix) => void
  onCopy: (fix: ImplementableFix) => void
  copiedId: string | null
}) {
  const details = explainInsight(insight)

  return (
    <div className="shrink-0 border-t border-[#1e2535] px-4 py-3 space-y-3 bg-[#0f1117]/80">
      <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Implementable fix</div>
      <h4 className="text-sm font-medium text-slate-100">{fix.title}</h4>
      <p className="text-[11px] text-slate-500 mt-0.5">{fix.description}</p>
      {fix.fileHint && <p className="text-[10px] font-mono text-blue-400/80 mt-1">→ {fix.fileHint}</p>}

      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onQuickPrompt(p.id)}
            className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-[#1e2535]"
          >
            {p.label}
          </button>
        ))}
      </div>

      <pre className="text-[11px] font-mono text-slate-300 bg-black/40 border border-[#1e2535] rounded-lg p-3 overflow-x-auto max-h-32 whitespace-pre-wrap">
        {fix.content}
      </pre>

      <p className="text-[10px] text-slate-500 leading-relaxed">{details.diagnosis}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onApplyFix(fix)}
          className="flex-1 text-xs font-medium py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          Apply to editor
        </button>
        <button
          type="button"
          onClick={() => onCopy(fix)}
          className="px-3 text-xs py-2 rounded-lg border border-[#1e2535] text-slate-300 hover:bg-white/5"
        >
          {copiedId === fix.id ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
