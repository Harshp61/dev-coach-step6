'use client'

interface MockEditorProps {
  fileName: string
  content: string
  highlightLines?: [number, number] | null
  appliedBanner?: string | null
}

export default function MockEditor({
  fileName,
  content,
  highlightLines,
  appliedBanner,
}: MockEditorProps) {
  const lines = content.split('\n')
  const [hlStart, hlEnd] = highlightLines ?? [0, 0]
  const shortName = fileName.split('/').pop()

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0d1117]">
      <EditorTabs shortName={shortName} appliedBanner={appliedBanner} />
      <EditorBody lines={lines} hlStart={hlStart} hlEnd={hlEnd} />
    </div>
  )
}

function EditorTabs({
  shortName,
  appliedBanner,
}: {
  shortName?: string
  appliedBanner?: string | null
}) {
  return (
    <div className="flex items-center gap-0 border-b border-[#1e2535] bg-[#0f1117] shrink-0">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-slate-200 bg-[#161b27] border-r border-[#1e2535] border-t-2 border-t-blue-500">
        <span className="text-blue-400">TS</span>
        {shortName}
        <span className="text-slate-500">●</span>
      </div>
      {appliedBanner && (
        <div className="ml-auto mr-3 flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
          <span>✓</span>
          {appliedBanner}
        </div>
      )}
    </div>
  )
}

function EditorBody({
  lines,
  hlStart,
  hlEnd,
}: {
  lines: string[]
  hlStart: number
  hlEnd: number
}) {
  return (
    <div className="flex-1 overflow-auto font-mono text-[13px] leading-6">
      <pre className="p-0 m-0">
        {lines.map((line, i) => {
          const lineNum = i + 1
          const highlighted = hlStart > 0 && lineNum >= hlStart && lineNum <= hlEnd
          return (
            <div
              key={i}
              className={`flex ${highlighted ? 'bg-amber-500/10 border-l-2 border-amber-400' : 'border-l-2 border-transparent'}`}
            >
              <span className="select-none w-12 shrink-0 text-right pr-4 text-slate-600">{lineNum}</span>
              <code className="flex-1 pr-6 text-slate-300 whitespace-pre">{line || ' '}</code>
            </div>
          )
        })}
      </pre>
    </div>
  )
}
