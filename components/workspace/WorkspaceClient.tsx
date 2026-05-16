'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Engineer, ImplementableFix, Insight } from '@/lib/types'
import { DEFAULT_EDITOR_CONTENT, DEFAULT_EDITOR_FILE, TEST_FILE_CONTENT } from '@/lib/editorSamples'
import IdeShell from '@/components/ide/IdeShell'
import MockEditor from '@/components/ide/MockEditor'
import CoachOverlay from '@/components/coach/CoachOverlay'
import NotificationBanner from '@/components/NotificationBanner'

interface WorkspaceClientProps {
  engineer: Engineer
  insights: Insight[]
  topInsight: Insight | null
  exampleKey: 'marcus' | 'l1-week'
}

export default function WorkspaceClient({
  engineer,
  insights,
  topInsight,
  exampleKey,
}: WorkspaceClientProps) {
  const [editorFile, setEditorFile] = useState(DEFAULT_EDITOR_FILE)
  const [editorContent, setEditorContent] = useState(DEFAULT_EDITOR_CONTENT)
  const [highlightLines, setHighlightLines] = useState<[number, number] | null>([18, 20])
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null)
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '$ npm test',
    'FAIL src/services/paymentService.test.ts',
    '  ● Test suite failed — no tests found',
  ])
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number | null>(
    insights.length > 0 ? 0 : null,
  )

  useEffect(() => {
    setSelectedInsightIndex(insights.length > 0 ? 0 : null)
  }, [insights])

  const exampleLabel =
    exampleKey === 'l1-week' ? 'Demo: Leo (L1 week)' : 'Demo: Marcus (L3)'

  const handleApplyFix = useCallback((fix: ImplementableFix) => {
    setAppliedBanner(fix.title)
    setHighlightLines(fix.highlightLines ?? null)

    if (fix.fileHint?.includes('.test.') || fix.title.toLowerCase().includes('test')) {
      setEditorFile('src/services/paymentService.test.ts')
      setEditorContent((prev) =>
        prev.includes('describe(') ? prev : `${TEST_FILE_CONTENT}\n${fix.content}`,
      )
    } else if (fix.kind === 'snippet' || fix.kind === 'patch') {
      setEditorFile(fix.fileHint ?? DEFAULT_EDITOR_FILE)
      setEditorContent((prev) => `${prev.trimEnd()}\n\n// ── Applied by DevCoach ──\n${fix.content}`)
    }

    if (fix.kind === 'command') {
      setTerminalLines((prev) => [...prev, '', `$ ${fix.content}`, '→ ready to run in your terminal'])
    }

    setTimeout(() => setAppliedBanner(null), 4000)
  }, [])

  return (
    <div className="relative h-[calc(100vh-49px)] w-full overflow-hidden">
      <NotificationBanner insight={topInsight} />

      <ExampleSwitcher exampleKey={exampleKey} />

      <IdeShell
        engineerName={engineer.name}
        team={engineer.team}
        exampleLabel={exampleLabel}
        editor={
          <MockEditor
            fileName={editorFile}
            content={editorContent}
            highlightLines={highlightLines}
            appliedBanner={appliedBanner}
          />
        }
        terminal={
          <div className="h-full px-4 py-2 font-mono text-[11px] text-slate-400 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Terminal</div>
            {terminalLines.map((line, i) => (
              <div key={i} className={line.startsWith('$') ? 'text-slate-300 mt-1' : ''}>
                {line}
              </div>
            ))}
          </div>
        }
      />

      <CoachOverlay
        insights={insights}
        engineer={engineer}
        selectedInsightIndex={selectedInsightIndex}
        onSelectInsight={setSelectedInsightIndex}
        onApplyFix={handleApplyFix}
      />
    </div>
  )
}

function ExampleSwitcher({ exampleKey }: { exampleKey: 'marcus' | 'l1-week' }) {
  return (
    <div className="absolute top-3 left-[calc(12rem+4.5rem)] z-30 flex gap-2 text-[10px] font-mono">
      <Link
        href="/?example=marcus"
        className={`px-2 py-1 rounded border transition-colors ${
          exampleKey === 'marcus'
            ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
            : 'border-[#1e2535] bg-[#161b27]/90 text-slate-500 hover:text-slate-300'
        }`}
      >
        Marcus
      </Link>
      <Link
        href="/?example=l1-week"
        className={`px-2 py-1 rounded border transition-colors ${
          exampleKey === 'l1-week'
            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
            : 'border-[#1e2535] bg-[#161b27]/90 text-slate-500 hover:text-slate-300'
        }`}
      >
        Leo
      </Link>
      <Link
        href="/manager"
        className="px-2 py-1 rounded border border-[#1e2535] bg-[#161b27]/90 text-slate-500 hover:text-slate-300"
      >
        Manager →
      </Link>
    </div>
  )
}

