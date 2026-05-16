'use client'

import { ReactNode } from 'react'

interface IdeShellProps {
  engineerName: string
  team: string
  exampleLabel: string
  editor: ReactNode
  sidebar?: ReactNode
  terminal?: ReactNode
}

const activityIcons = ['⌂', '◇', '⎇', '▣', '⚙']

export default function IdeShell({
  engineerName,
  team,
  exampleLabel,
  editor,
  sidebar,
  terminal,
}: IdeShellProps) {
  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-300">
      {/* Title bar */}
      <IdeTitleBar engineerName={engineerName} team={team} exampleLabel={exampleLabel} />

      <div className="flex flex-1 min-h-0">
        {/* Activity bar */}
        <aside className="w-12 shrink-0 flex flex-col items-center py-3 gap-4 border-r border-[#1e2535] bg-[#0f1117]">
          {activityIcons.map((icon, i) => (
            <button
              key={i}
              type="button"
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                i === 0 ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
              aria-label={`Activity ${i}`}
            >
              {icon}
            </button>
          ))}
        </aside>

        {/* File explorer */}
        <aside className="w-52 shrink-0 border-r border-[#1e2535] bg-[#0f1117] flex flex-col min-h-0">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 border-b border-[#1e2535]">
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-0.5">
            {sidebar ?? <DefaultFileTree />}
          </div>
        </aside>

        {/* Editor + terminal */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-0">{editor}</div>
          {terminal && (
            <div className="h-36 shrink-0 border-t border-[#1e2535] bg-[#0a0d12]">{terminal}</div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <footer className="h-6 shrink-0 flex items-center justify-between px-3 text-[10px] font-mono bg-[#4f8ef7] text-white">
        <span>main ● 2 problems</span>
        <span className="flex items-center gap-4">
          <span>Ln 18, Col 1</span>
          <span>TypeScript</span>
          <span>UTF-8</span>
        </span>
      </footer>
    </div>
  )
}

function IdeTitleBar({
  engineerName,
  team,
  exampleLabel,
}: {
  engineerName: string
  team: string
  exampleLabel: string
}) {
  return (
    <header className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-[#1e2535] bg-[#161b27] text-xs">
      <div className="flex items-center gap-3">
        <span className="font-mono text-blue-400 tracking-widest uppercase text-[10px]">DevCoach IDE</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">payments-service</span>
      </div>
      <div className="flex items-center gap-3 text-slate-500">
        <span className="text-amber-400/90">{exampleLabel}</span>
        <span>{engineerName}</span>
        <span className="text-slate-600">·</span>
        <span>{team}</span>
      </div>
    </header>
  )
}

function DefaultFileTree() {
  const tree = [
    { name: 'src/', indent: 0, open: true },
    { name: 'services/', indent: 1, open: true },
    { name: 'paymentService.ts', indent: 2, active: true },
    { name: 'paymentService.test.ts', indent: 2, warn: true },
    { name: 'utils/', indent: 1 },
    { name: '.github/', indent: 0 },
    { name: 'workflows/', indent: 1 },
  ]

  return (
    <>
      {tree.map((item) => (
        <div
          key={item.name}
          className={`px-2 py-1 rounded cursor-default truncate ${
            item.active
              ? 'bg-blue-500/15 text-blue-300'
              : item.warn
                ? 'text-amber-400/90'
                : 'text-slate-400'
          }`}
          style={{ paddingLeft: `${8 + item.indent * 12}px` }}
        >
          {item.warn && <span className="mr-1">⚠</span>}
          {item.name}
        </div>
      ))}
    </>
  )
}
