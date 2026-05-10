import { getManagers, getEngineersByTeam } from '@/lib/data'
import { generateInsights } from '@/lib/insights'

const maturityLabels = ['Unstructured', 'Reactive', 'Developing', 'Strong', 'Advanced', 'Expert']
const maturityColor = ['text-red-400', 'text-red-400', 'text-amber-400', 'text-emerald-400', 'text-blue-400', 'text-blue-400']

function VelocitySparkline({ trend }: { trend: number[] }) {
  const max = Math.max(...trend)
  const min = Math.min(...trend, 0)
  const range = max - min || 1
  const w = 48
  const h = 24
  const pts = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  const rising = trend[trend.length - 1] >= trend[0]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={rising ? '#4caf82' : '#e85d5d'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {trend.map((v, i) => {
        const x = (i / (trend.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return <circle key={i} cx={x} cy={y} r="2" fill={rising ? '#4caf82' : '#e85d5d'} />
      })}
    </svg>
  )
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-blue-400',
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${colors[severity] ?? 'bg-slate-500'}`} />
}

export default function ManagerPage() {
  const managers = getManagers()

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Manager View</h1>
        <p className="text-muted text-sm mt-1">Coaching insights only — no raw metrics</p>
      </div>

      {managers.map((manager) => {
        const teamEngineers = getEngineersByTeam(manager.teamId).filter(e => e.role !== 'manager')
        const ts = manager.teamSummary!
        const allInsights = teamEngineers.map(e => ({
          engineer: e,
          insights: generateInsights(e),
        }))
        const needsAttention = allInsights
          .filter(({ insights }) => insights.some(i => i.severity === 'high' || i.severity === 'medium'))
          .sort((a, b) => {
            const score = (ins: ReturnType<typeof generateInsights>) =>
              ins.filter(i => i.severity === 'high').length * 10 +
              ins.filter(i => i.severity === 'medium').length
            return score(b.insights) - score(a.insights)
          })

        const trendDir = ts.velocityTrend[ts.velocityTrend.length - 1] >= ts.velocityTrend[0]

        return (
          <div key={manager.id} className="space-y-5">
            {/* Team header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{manager.team}</h2>
                <p className="text-xs text-muted mt-0.5 font-mono">Led by {manager.name}</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Velocity sparkline */}
                <div className="text-right">
                  <div className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1.5">Velocity trend</div>
                  <div className="flex items-center gap-2">
                    <VelocitySparkline trend={ts.velocityTrend} />
                    <span className={`text-xs font-mono ${trendDir ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trendDir ? '↑' : '↓'} {ts.velocityTrend[ts.velocityTrend.length - 1]}%
                    </span>
                  </div>
                </div>
                {/* Median maturity */}
                <div className="card px-3 py-2 text-center">
                  <div className="text-[10px] text-muted font-mono uppercase tracking-widest">Median</div>
                  <div className={`text-xl font-mono font-semibold mt-0.5 ${maturityColor[ts.medianMaturityLevel]}`}>
                    L{ts.medianMaturityLevel}
                  </div>
                  <div className="text-[10px] text-muted">{maturityLabels[ts.medianMaturityLevel]}</div>
                </div>
              </div>
            </div>

            {/* Who needs attention */}
            {needsAttention.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted mb-3">
                  Who needs attention <span className="text-slate-600">({needsAttention.length})</span>
                </h3>
                <div className="space-y-3">
                  {needsAttention.map(({ engineer, insights }) => {
                    const topInsight = insights[0]
                    const highCount = insights.filter(i => i.severity === 'high').length
                    const medCount = insights.filter(i => i.severity === 'medium').length

                    return (
                      <div key={engineer.id} className="card p-4 space-y-3">
                        {/* Engineer row */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-100">{engineer.name}</span>
                              <span className={`text-xs font-mono ${maturityColor[engineer.maturityLevel]}`}>
                                L{engineer.maturityLevel}
                              </span>
                              <span className="text-xs text-muted">·</span>
                              <span className="text-xs text-muted">{engineer.jobTitle}</span>
                            </div>
                            {/* Insight count pills */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {highCount > 0 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                  {highCount} critical
                                </span>
                              )}
                              {medCount > 0 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {medCount} medium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top insight */}
                        <div className="bg-surface rounded-lg px-3.5 py-3 border border-border space-y-2">
                          <div className="flex items-start gap-2">
                            <SeverityDot severity={topInsight.severity} />
                            <p className="text-xs text-slate-300 leading-relaxed">{topInsight.message}</p>
                          </div>
                          <div className="pl-3.5">
                            <div className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">→ Coaching action</div>
                            <p className="text-xs text-slate-400 leading-relaxed">{topInsight.action}</p>
                          </div>
                        </div>

                        {/* Remaining insights collapsed */}
                        {insights.length > 1 && (
                          <div className="pl-0.5 space-y-1">
                            {insights.slice(1).map((ins, j) => (
                              <div key={j} className="flex items-start gap-2">
                                <SeverityDot severity={ins.severity} />
                                <p className="text-xs text-muted leading-relaxed">{ins.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Top coaching actions */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Top coaching actions</h3>
              <div className="card p-4 space-y-3">
                {ts.topCoachingActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-accent font-mono text-xs font-semibold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team roster — maturity overview */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Team roster</h3>
              <div className="grid grid-cols-2 gap-2">
                {teamEngineers.map((e) => {
                  const eInsights = allInsights.find(a => a.engineer.id === e.id)?.insights ?? []
                  const topSeverity = eInsights[0]?.severity
                  return (
                    <div key={e.id} className="card px-3.5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-200">{e.name}</div>
                        <div className="text-xs text-muted mt-0.5">{e.jobTitle}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {topSeverity && <SeverityDot severity={topSeverity} />}
                        <span className={`text-sm font-mono font-semibold ${maturityColor[e.maturityLevel]}`}>
                          L{e.maturityLevel}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
