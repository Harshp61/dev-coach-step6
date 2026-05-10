'use client'

import { useState } from 'react'
import { Insight } from '@/lib/types'
import { explainInsight } from '@/lib/insights'

interface AgentPanelProps {
  insights: Insight[]
  engineerName: string
  maturityLevel: number
}

const severityConfig = {
  high: {
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
    bar: 'bg-red-400',
    label: 'Critical',
    icon: '⚡',
  },
  medium: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    bar: 'bg-amber-400',
    label: 'Improve',
    icon: '◆',
  },
  low: {
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    bar: 'bg-blue-400',
    label: 'Tip',
    icon: '○',
  },
}

export default function AgentPanel({ insights, engineerName, maturityLevel }: AgentPanelProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)

  const highCount = insights.filter(i => i.severity === 'high').length
  const hasCritical = highCount > 0

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open coaching agent"
      >
        {/* Badge */}
        {!open && insights.length > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-mono font-bold shadow-lg">
            {insights.length}
          </span>
        )}

        <div className={`
          relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl
          transition-all duration-300 ease-out
          ${open
            ? 'bg-slate-700 rotate-45 scale-95'
            : hasCritical
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 hover:scale-110 hover:shadow-blue-500/30'
              : 'bg-gradient-to-br from-slate-600 to-slate-800 hover:scale-110'
          }
        `}>
          {/* Pulse ring on critical */}
          {!open && hasCritical && (
            <span className="absolute inset-0 rounded-2xl bg-blue-400 opacity-20 animate-ping" />
          )}

          {open ? (
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
        </div>
      </button>

      {/* Panel */}
      <div className={`
        fixed bottom-24 right-6 z-40 w-[380px] max-h-[70vh]
        flex flex-col
        bg-[#161b27] border border-[#1e2535] rounded-2xl shadow-2xl shadow-black/50
        transition-all duration-300 ease-out origin-bottom-right
        ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
      `}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1e2535] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.15em]">Coach</span>
              {hasCritical && (
                <span className="flex items-center gap-1 text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot inline-block" />
                  {highCount} critical
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mt-0.5">Today's Focus</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono">L{maturityLevel} → L{Math.min(maturityLevel + 1, 5)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{engineerName.split(' ')[0]}</div>
          </div>
        </div>

        {/* Insight cards */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {insights.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-2xl mb-2">✦</div>
              <div className="text-sm text-slate-400">You're in great shape today.</div>
              <div className="text-xs text-slate-600 mt-1">No coaching actions needed.</div>
            </div>
          ) : (
            insights.map((insight, i) => {
              const cfg = severityConfig[insight.severity]
              const isExpanded = expanded === i
              const details = explainInsight(insight)

              return (
                <div
                  key={i}
                  className={`
                    rounded-xl border transition-all duration-200 cursor-pointer
                    ${isExpanded
                      ? 'bg-[#0f1117] border-[#2a3347]'
                      : 'bg-[#0f1117]/60 border-[#1e2535] hover:border-[#2a3347]'
                    }
                  `}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 p-3.5">
                    {/* Severity dot */}
                    <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${insight.severity === 'high' ? 'pulse-dot' : ''}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-snug">{insight.message}</p>
                    </div>

                    {/* Expand chevron */}
                    <svg
                      className={`w-3.5 h-3.5 text-slate-500 shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 space-y-3 border-t border-[#1e2535] pt-3">
                      {/* Coaching diagnosis */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">◎ Diagnosis</div>
                        <div className="text-xs text-slate-300 leading-relaxed">
                          {details.diagnosis}
                        </div>
                      </div>

                      {/* Fix playbook */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">→ Fix playbook</div>
                        <div className="text-xs text-slate-300 leading-relaxed bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2.5 space-y-1.5">
                          {details.fixSteps.map((step, idx) => (
                            <p key={idx}>{idx + 1}. {step}</p>
                          ))}
                        </div>
                      </div>

                      {/* Expected outcome */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">◆ Expected result</div>
                        <div className="text-xs text-slate-400 leading-relaxed">
                          {details.expectedOutcome}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e2535] shrink-0">
          <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
            <span>{insights.length} insight{insights.length !== 1 ? 's' : ''} · updated now</span>
            <span>Target: L{Math.min(maturityLevel + 1, 5)}</span>
          </div>
        </div>
      </div>
    </>
  )
}
