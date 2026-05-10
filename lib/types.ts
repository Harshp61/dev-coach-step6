export type Severity = 'low' | 'medium' | 'high'
export type Role = 'manager' | 'individual_contributor'

export interface PR {
  title: string
  hoursOpen: number
  reviewersCount: number
  testsIncluded: boolean
  businessImpact: string
}

export interface Commit {
  message: string
  hasTicketReference: boolean
}

export interface TodayActivity {
  activePRs: PR[]
  commits: Commit[]
  aiUsageMinutes: number
  testsWrittenToday: number
  codeReviewsGivenToday: number
}

export interface SprintSummary {
  storiesCommitted: number
  storiesCompleted: number
  velocity: number
  testCoverageStart: number
  testCoverageEnd: number
  buildFailures: number
  productionIncidents: number
  commitsMissingTicketLinks: number
}

export interface KPIs {
  ticketCycleTime: number
  deploymentFrequency: number
  changeFailureRate: number
  aiCodingToolAdoption: number
  automatedDeployment: number
  policyExceptions: number
}

export interface BlockedEngineer {
  name: string
  reason: string
}

export interface TeamSummary {
  medianMaturityLevel: number
  velocityTrend: number[]
  blockedEngineers: BlockedEngineer[]
  topCoachingActions: string[]
}

export interface Engineer {
  id: string
  name: string
  email: string
  jobTitle: string
  team: string
  teamId: string
  role: Role
  maturityLevel: number
  kpis: KPIs
  sprintSummary: SprintSummary
  todayActivity: TodayActivity
  teamSummary?: TeamSummary
}

export interface Insight {
  message: string
  action: string
  why: string
  severity: Severity
}
