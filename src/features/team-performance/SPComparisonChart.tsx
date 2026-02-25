import { ChartContainer } from '@/components/charts/ChartContainer'
import { BarChart } from '@/components/charts/BarChart'
import type { TeamMemberPerformance } from '@/types/team'

interface SPComparisonChartProps {
  data: TeamMemberPerformance[]
}

export function SPComparisonChart({ data }: SPComparisonChartProps) {
  const chartData = data.map((sp) => ({
    name: sp.member.name,
    tamamlanan: sp.completedCount,
    atanan: sp.assignedCount,
    başarıSkoru: sp.successScore,
  }))

  return (
    <ChartContainer title="SP Performans Karşılaştırması" height={350}>
      <BarChart
        data={chartData}
        keys={['tamamlanan', 'atanan']}
        indexBy="name"
        groupMode="grouped"
        enableLabel
        margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
        colors={['#2a6373', '#9cb4bd']}
      />
    </ChartContainer>
  )
}
