import { ImplementableFix, Insight } from './types'

const defaultFix = (insight: Insight): ImplementableFix => ({
  id: 'generic-action',
  title: 'Apply coaching action',
  description: insight.action,
  kind: 'checklist',
  content: `□ ${insight.action}\n□ Verify in your next PR or deploy\n□ Note outcome in standup`,
})

export function getImplementableFix(insight: Insight, index: number): ImplementableFix {
  const msg = insight.message.toLowerCase()

  if (msg.includes('no tests') || msg.includes("haven't written any tests")) {
    return {
      id: `fix-tests-${index}`,
      title: 'Add PR smoke test',
      description: 'Drop this at the bottom of your service test file before requesting review.',
      kind: 'snippet',
      language: 'typescript',
      fileHint: 'src/services/paymentService.test.ts',
      highlightLines: [18, 24],
      content: `describe('processPayment', () => {
  it('returns success for valid payload', async () => {
    const result = await processPayment({
      amount: 100,
      currency: 'USD',
      accountId: 'acc_test_001',
    })
    expect(result.status).toBe('success')
  })
})`,
    }
  }

  if (msg.includes('no reviewers')) {
    return {
      id: `fix-reviewers-${index}`,
      title: 'Request review in PR description',
      description: 'Paste into your PR — assigns reviewers and sets SLA expectations.',
      kind: 'patch',
      content: `## Reviewers
/cc @payments-oncall @senior-backend

## Checklist
- [ ] Unit tests added or updated
- [ ] CI green
- [ ] Linked ticket: PAY-`,
    }
  }

  if (msg.includes('open') && msg.includes('without merging')) {
    return {
      id: `fix-stale-pr-${index}`,
      title: 'Unblock stale PR',
      description: 'Comment template to ping reviewers and shrink scope if needed.',
      kind: 'patch',
      content: `@reviewers Friendly ping — this has been open 24h+.

Options if blocked:
1. Approve as-is if risk is low
2. I can split into: (a) API change (b) UI follow-up

Happy to jump on a 10m sync.`,
    }
  }

  if (msg.includes('change failure rate')) {
    return {
      id: `fix-cfr-${index}`,
      title: 'Pre-deploy verification script',
      description: 'Run locally before pushing to catch regressions early.',
      kind: 'command',
      content: 'npm run test -- --coverage && npm run lint && npm run build',
      fileHint: 'package.json scripts',
    }
  }

  if (msg.includes('build failures')) {
    return {
      id: `fix-precommit-${index}`,
      title: 'Pre-commit test hook',
      description: 'Prevents broken commits from reaching CI.',
      kind: 'snippet',
      language: 'json',
      fileHint: '.husky/pre-commit',
      content: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npm test -- --passWithNoTests --findRelatedTests $(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' || true)`,
    }
  }

  if (msg.includes('no ticket reference') || msg.includes('ticket reference')) {
    return {
      id: `fix-commit-${index}`,
      title: 'Commit message convention',
      description: 'Prefix every commit with the Jira key for traceability.',
      kind: 'command',
      content: 'git commit -m "PAY-123: describe the change in imperative mood"',
    }
  }

  if (msg.includes('ai coding tools') || msg.includes('ai tool')) {
    return {
      id: `fix-ai-${index}`,
      title: 'AI-assisted test scaffold',
      description: 'Use your IDE assistant to generate tests from this prompt.',
      kind: 'patch',
      content: `Generate unit tests for processPayment in paymentService.ts:
- happy path USD payment
- invalid amount throws
- missing accountId throws
Use Jest, mock external payment gateway.`,
    }
  }

  if (msg.includes('deploying less than once') || msg.includes('deploying') && msg.includes('/week')) {
    return {
      id: `fix-deploy-${index}`,
      title: 'Feature flag slice',
      description: 'Ship behind a flag to deploy smaller increments this week.',
      kind: 'snippet',
      language: 'typescript',
      fileHint: 'src/config/featureFlags.ts',
      highlightLines: [1, 6],
      content: `export const featureFlags = {
  paymentRetryV2: process.env.FF_PAYMENT_RETRY === 'true',
} as const

// In handler: if (featureFlags.paymentRetryV2) { ... }`,
    }
  }

  if (msg.includes('automated')) {
    return {
      id: `fix-ci-${index}`,
      title: 'Minimal deploy workflow',
      description: 'Starter GitHub Action for automated deploy on main.',
      kind: 'snippet',
      language: 'yaml',
      fileHint: '.github/workflows/deploy.yml',
      content: `name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test && npm run build
      - run: npm run deploy:staging`,
    }
  }

  if (msg.includes('policy exceptions')) {
    return {
      id: `fix-policy-${index}`,
      title: 'Exception root-cause note',
      description: 'Document once so you stop repeating the same exception.',
      kind: 'patch',
      content: `## Policy exception RCA
- Exception type:
- Root cause:
- Permanent fix ticket:
- Owner:
- Target date:`,
    }
  }

  if (msg.includes('ticket takes') && msg.includes('days')) {
    return {
      id: `fix-cycle-${index}`,
      title: 'Slice ticket for today',
      description: 'Break work into a shippable vertical slice.',
      kind: 'checklist',
      content: `□ Define smallest user-visible outcome for today
□ Create sub-task in Jira with 1-day estimate
□ Open draft PR before EOD (even if behind flag)
□ List blockers in standup, not in Slack threads`,
    }
  }

  if (msg.includes('delivery patterns are solid')) {
    return {
      id: `fix-mentor-${index}`,
      title: 'Mentoring offer template',
      description: 'Reach out to a Level 1 engineer with a concrete offer.',
      kind: 'patch',
      content: `Hey — I noticed you're working on payments. Want to pair for 30m on PR hygiene or test setup? I can review your next PR same-day.`,
    }
  }

  return defaultFix(insight)
}
