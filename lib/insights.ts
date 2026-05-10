import { Engineer, Insight } from './types'

export interface InsightExplanation {
  diagnosis: string
  fixSteps: string[]
  expectedOutcome: string
}

export function generateInsights(engineer: Engineer): Insight[] {
  const insights: Insight[] = []
  const { kpis, todayActivity, sprintSummary, maturityLevel } = engineer

  // ─── PR Rules ───────────────────────────────────────────────

  for (const pr of todayActivity.activePRs) {
    // PR open > 24h AND no tests
    if (pr.hoursOpen > 24 && !pr.testsIncluded) {
      insights.push({
        message: `Your PR "${pr.title}" has been open ${pr.hoursOpen}h with no tests.`,
        action: 'Add at least one unit test before requesting review.',
        why: 'PRs without tests take 2× longer to merge and are the #1 cause of change failures at your level.',
        severity: 'high',
      })
    }

    // PR open > 24h but has tests — just stale
    else if (pr.hoursOpen > 24 && pr.testsIncluded) {
      insights.push({
        message: `Your PR "${pr.title}" has been open ${pr.hoursOpen}h without merging.`,
        action: 'Ping reviewers directly or break it into a smaller chunk to unblock.',
        why: 'Stale PRs slow your cycle time and create merge conflicts that eat your focus time.',
        severity: 'medium',
      })
    }

    // PR with no reviewers
    if (pr.reviewersCount === 0) {
      insights.push({
        message: `"${pr.title}" has no reviewers assigned.`,
        action: 'Assign at least one reviewer now — don\'t wait for someone to notice.',
        why: 'Unreviewed PRs are the single biggest bottleneck to your deployment frequency.',
        severity: 'high',
      })
    }
  }

  // ─── Change Failure Rate ─────────────────────────────────────

  if (kpis.changeFailureRate > 15) {
    insights.push({
      message: `Your change failure rate is ${kpis.changeFailureRate}% — above the safe threshold.`,
      action: 'Before your next deploy, run the full test suite and review the last 3 failures for patterns.',
      why: 'High failure rates erode team trust and make managers hesitant to give you ownership of critical paths.',
      severity: 'high',
    })
  }

  // ─── AI Tool Usage ───────────────────────────────────────────

  if (kpis.aiCodingToolAdoption < 60) {
    const gap = 60 - kpis.aiCodingToolAdoption
    insights.push({
      message: `You're using AI coding tools ${kpis.aiCodingToolAdoption}% of the time — ${gap}% below the team target.`,
      action: 'Try using Copilot or Cursor for your next feature ticket end-to-end.',
      why: `Engineers hitting 60%+ AI adoption ship ${gap > 20 ? 'significantly' : 'noticeably'} faster and spend more time on architecture, less on boilerplate.`,
      severity: 'medium',
    })
  }

  // ─── Deployment Frequency ────────────────────────────────────

  if (kpis.deploymentFrequency < 1) {
    insights.push({
      message: `You're deploying less than once a week (${kpis.deploymentFrequency}/week).`,
      action: 'Break your current ticket into smaller shippable units — aim to deploy something by Friday.',
      why: 'Infrequent deploys mean bigger batches, more risk, and slower feedback. Level 3 engineers ship at least weekly.',
      severity: 'high',
    })
  } else if (kpis.deploymentFrequency < 2) {
    insights.push({
      message: `You're deploying ${kpis.deploymentFrequency}×/week — room to increase cadence.`,
      action: 'Look for one ticket this sprint that can ship independently without waiting for a larger release.',
      why: 'Increasing deploy frequency is the fastest path from Level 2 to Level 3.',
      severity: 'low',
    })
  }

  // ─── Ticket Cycle Time ───────────────────────────────────────

  if (kpis.ticketCycleTime > 55) {
    insights.push({
      message: `Your average ticket takes ${kpis.ticketCycleTime} days — above the 55-day target.`,
      action: 'Pick one in-progress ticket and ask: what\'s the smallest version I can ship today?',
      why: 'Long cycle times signal scope creep or blocked dependencies. Reducing it is a direct path to promotion readiness.',
      severity: 'medium',
    })
  }

  // ─── Automated Deployments ───────────────────────────────────

  if (kpis.automatedDeployment < 60) {
    insights.push({
      message: `Only ${kpis.automatedDeployment}% of your deployments are automated.`,
      action: 'Set up a basic CI deploy step for your next ticket — even a simple GitHub Action counts.',
      why: 'Manual deploys are slow, error-prone, and a blocker to reaching Level 3 maturity.',
      severity: 'medium',
    })
  }

  // ─── Policy Exceptions ───────────────────────────────────────

  if (kpis.policyExceptions >= 5) {
    insights.push({
      message: `You've hit ${kpis.policyExceptions} policy exceptions this quarter.`,
      action: 'Review your last 2 exceptions and identify if there\'s a recurring root cause to fix upstream.',
      why: 'Policy exceptions create compliance risk and are flagged in performance reviews. Fixing the root cause removes repeated friction.',
      severity: kpis.policyExceptions >= 7 ? 'high' : 'medium',
    })
  }

  // ─── Build Failures ──────────────────────────────────────────

  if (sprintSummary.buildFailures >= 5) {
    insights.push({
      message: `${sprintSummary.buildFailures} build failures this sprint is slowing your whole team.`,
      action: 'Run `npm test` (or equivalent) locally before every push — set up a pre-commit hook.',
      why: 'Repeated CI failures block teammates and signal unstable foundations. A pre-commit hook takes 5 minutes to set up.',
      severity: sprintSummary.buildFailures >= 8 ? 'high' : 'medium',
    })
  }

  // ─── Missing Ticket Links ────────────────────────────────────

  if (sprintSummary.commitsMissingTicketLinks > 3) {
    insights.push({
      message: `${sprintSummary.commitsMissingTicketLinks} commits this sprint have no ticket reference.`,
      action: 'Prefix commits with your ticket ID (e.g. PAY-123: your message). Takes 3 seconds.',
      why: 'Missing references break traceability, make code reviews slower, and are flagged in compliance audits.',
      severity: 'low',
    })
  }

  // ─── Tests Written Today ─────────────────────────────────────

  if (todayActivity.testsWrittenToday === 0 && todayActivity.activePRs.length > 0) {
    insights.push({
      message: 'You have active PRs but haven\'t written any tests today.',
      action: 'Before EOD, add at least one test — even a happy-path smoke test.',
      why: 'Consistent daily testing habits are what separate Level 2 from Level 3 engineers.',
      severity: 'medium',
    })
  }

  // ─── Positive Reinforcement (Level 3+) ──────────────────────

  if (maturityLevel >= 3 && kpis.changeFailureRate <= 12 && kpis.deploymentFrequency >= 2) {
    insights.push({
      message: 'Your delivery patterns are solid — stable deploys and good cadence.',
      action: 'Consider taking on a cross-team code review or mentoring a Level 1 engineer this sprint.',
      why: 'At Level 3, your leverage multiplies when you help others level up. That\'s the path to Staff.',
      severity: 'low',
    })
  }

  // Sort: high → medium → low
  const order = { high: 0, medium: 1, low: 2 }
  return insights.sort((a, b) => order[a.severity] - order[b.severity])
}

export function getTopInsight(insights: Insight[]): Insight | null {
  return insights[0] ?? null
}

export function explainInsight(insight: Insight): InsightExplanation {
  const fixSteps = [
    `Right now: ${insight.action}`,
    'Before your next PR, repeat this on one more change to make the habit stick.',
    'At sprint end, review if this reduced rework and waiting time.',
  ]

  const diagnosis =
    insight.severity === 'high'
      ? `This is a priority blocker. ${insight.why}`
      : insight.severity === 'medium'
        ? `This is a momentum gap. ${insight.why}`
        : `This is a leverage opportunity. ${insight.why}`

  const expectedOutcome =
    insight.severity === 'high'
      ? 'You should see fewer fire-fights, faster reviews, and better trust in your code changes.'
      : insight.severity === 'medium'
        ? 'You should notice smoother delivery and fewer delays in the next 1-2 weeks.'
        : 'You should build stronger consistency and clearer promotion signals over this sprint.'

  return { diagnosis, fixSteps, expectedOutcome }
}
