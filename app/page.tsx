import Link from 'next/link'
import { getCurrentEngineer, getEngineerById } from '@/lib/data'
import { generateInsights, getTopInsight } from '@/lib/insights'
import AgentPanel from '@/components/AgentPanel'
import NotificationBanner from '@/components/NotificationBanner'

interface HomePageProps {
  searchParams?: {
    example?: string
  }
}

export default function HomePage({ searchParams }: HomePageProps) {
  const selectedExample = searchParams?.example === 'l1-week' ? 'l1-week' : 'marcus'
  const engineer =
    selectedExample === 'l1-week'
      ? getEngineerById('eng-004') ?? getCurrentEngineer()
      : getEngineerById('eng-002') ?? getCurrentEngineer()

  const insights = generateInsights(engineer)
  const topInsight = getTopInsight(insights)
  const highCount = insights.filter(i => i.severity === 'high').length
  const mediumCount = insights.filter(i => i.severity === 'medium').length

  const maturityLabels = ['Unstructured', 'Reactive', 'Developing', 'Strong', 'Advanced', 'Expert']

  return (
    <div className="space-y-6">
      {/* Notification — top of page, auto-dismisses */}
      <NotificationBanner insight={topInsight} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{engineer.name}</h1>
          <p className="text-muted text-sm mt-1">{engineer.jobTitle} · {engineer.team}</p>
          <p className="text-xs text-slate-400 mt-3 max-w-xl leading-relaxed">
            Focused coaching for your next level: clear priorities, concrete fixes, and why each move improves delivery trust.
          </p>
        </div>
        <div className="card px-4 py-2 text-right">
          <div className="text-xs text-muted mb-1">Maturity Level</div>
          <div className="font-mono text-lg font-medium text-slate-100">
            L{engineer.maturityLevel}
            <span className="text-xs text-muted ml-2">{maturityLabels[engineer.maturityLevel]}</span>
          </div>
        </div>
      </div>

      {/* Example selector */}
      <div className="card p-4">
        <div className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Demo Examples</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Link
            href="/?example=marcus"
            className={`rounded-lg border px-3.5 py-3 transition-colors ${
              selectedExample === 'marcus'
                ? 'border-blue-500/40 bg-blue-500/10'
                : 'border-border bg-surface hover:border-blue-500/25'
            }`}
          >
            <div className="text-sm text-slate-100">Marcus — solid status</div>
            <div className="text-xs text-slate-400 mt-1">Level 3, healthy rhythm, coach nudges for next-level leverage.</div>
          </Link>

          <Link
            href="/?example=l1-week"
            className={`rounded-lg border px-3.5 py-3 transition-colors ${
              selectedExample === 'l1-week'
                ? 'border-amber-500/40 bg-amber-500/10'
                : 'border-border bg-surface hover:border-amber-500/25'
            }`}
          >
            <div className="text-sm text-slate-100">Leo Marchetti</div>
            <div className="text-xs text-slate-400 mt-1">Level 1, high-friction week, detailed fixes and coaching plan.</div>
          </Link>
        </div>
      </div>

      {/* Coach brief */}
      <div className="card p-5 space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Coach Brief</h2>
        {topInsight ? (
          <>
            <p className="text-sm text-slate-200 leading-relaxed">{topInsight.message}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {highCount > 0
                ? `${highCount} critical pattern${highCount > 1 ? 's' : ''} to stabilize first.`
                : `${mediumCount} growth area${mediumCount !== 1 ? 's' : ''} to tighten this sprint.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">
            You're stable today. Use the Coach panel to pick one stretch action and compound it this week.
          </p>
        )}
      </div>

      {/* Weekly view */}
      <div className="card p-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">Weekly Coaching View</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-surface rounded-lg px-3 py-2.5 border border-border">
            <div className="text-lg font-semibold text-slate-100">{engineer.sprintSummary.storiesCompleted}</div>
            <div className="text-[11px] text-muted mt-1">Stories shipped</div>
          </div>
          <div className="bg-surface rounded-lg px-3 py-2.5 border border-border">
            <div className="text-lg font-semibold text-slate-100">{engineer.sprintSummary.buildFailures}</div>
            <div className="text-[11px] text-muted mt-1">Build breaks</div>
          </div>
          <div className="bg-surface rounded-lg px-3 py-2.5 border border-border">
            <div className="text-lg font-semibold text-slate-100">{engineer.sprintSummary.productionIncidents}</div>
            <div className="text-[11px] text-muted mt-1">Incidents</div>
          </div>
          <div className="bg-surface rounded-lg px-3 py-2.5 border border-border">
            <div className="text-lg font-semibold text-slate-100">{engineer.sprintSummary.commitsMissingTicketLinks}</div>
            <div className="text-[11px] text-muted mt-1">Missing links</div>
          </div>
        </div>
      </div>

      {/* Coaching context */}
      <div className="card p-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">Coaching Context</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-slate-100">
              {engineer.sprintSummary.storiesCompleted}
              <span className="text-muted text-base">/{engineer.sprintSummary.storiesCommitted}</span>
            </div>
            <div className="text-xs text-muted mt-1">Stories Done</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-100">{engineer.sprintSummary.velocity}%</div>
            <div className="text-xs text-muted mt-1">Velocity</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-100">{engineer.sprintSummary.testCoverageEnd}%</div>
            <div className="text-xs text-muted mt-1">Test Coverage</div>
          </div>
        </div>
      </div>

      {/* Today's activity */}
      <div className="card p-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-1">Today&apos;s Signals</h2>
        <p className="text-xs text-slate-500 mb-4">These inputs help tailor your next best coaching action.</p>
        <div className="grid grid-cols-3 gap-4 text-center mb-5">
          <div>
            <div className="text-xl font-semibold text-slate-100">{engineer.todayActivity.aiUsageMinutes}m</div>
            <div className="text-xs text-muted mt-1">AI Usage</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-slate-100">{engineer.todayActivity.testsWrittenToday}</div>
            <div className="text-xs text-muted mt-1">Tests Written</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-slate-100">{engineer.todayActivity.codeReviewsGivenToday}</div>
            <div className="text-xs text-muted mt-1">Reviews Given</div>
          </div>
        </div>

        {engineer.todayActivity.activePRs.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted mb-2">Active PRs</div>
            {engineer.todayActivity.activePRs.map((pr, i) => (
              <div key={i} className="bg-surface rounded-lg px-4 py-3 border border-border">
                <div className="text-sm text-slate-200 font-medium">{pr.title}</div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                  <span>⏱ {pr.hoursOpen}h open</span>
                  <span>👥 {pr.reviewersCount} reviewer{pr.reviewersCount !== 1 ? 's' : ''}</span>
                  <span className={pr.testsIncluded ? 'text-success' : 'text-critical'}>
                    {pr.testsIncluded ? '✓ tests' : '✗ no tests'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coaching hint */}
      <p className="text-center text-xs text-muted">
        {insights.length > 0
          ? `${insights.length} coaching insight${insights.length > 1 ? 's' : ''} available — open Coach for diagnosis + fix plan ↘`
          : 'No urgent issues detected today ✦'}
      </p>

      {/* Floating Agent */}
      <AgentPanel
        insights={insights}
        engineerName={engineer.name}
        maturityLevel={engineer.maturityLevel}
      />
    </div>
  )
}
