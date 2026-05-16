import { getCurrentEngineer, getEngineerById } from '@/lib/data'
import { generateInsights, getTopInsight } from '@/lib/insights'
import WorkspaceClient from '@/components/workspace/WorkspaceClient'

interface HomePageProps {
  searchParams?: {
    example?: string
  }
}

export default function HomePage({ searchParams }: HomePageProps) {
  const exampleKey = searchParams?.example === 'l1-week' ? 'l1-week' : 'marcus'
  const engineer =
    exampleKey === 'l1-week'
      ? getEngineerById('eng-004') ?? getCurrentEngineer()
      : getEngineerById('eng-002') ?? getCurrentEngineer()

  const insights = generateInsights(engineer)
  const topInsight = getTopInsight(insights)

  return (
    <WorkspaceClient
      engineer={engineer}
      insights={insights}
      topInsight={topInsight}
      exampleKey={exampleKey}
    />
  )
}
