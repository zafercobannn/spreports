import { ChartContainer } from '@/components/charts/ChartContainer'
import { HeatmapChart } from '@/components/charts/HeatmapChart'
import { formatCompactNumber } from '@/utils/format'
import type { CohortMatrix } from '@/types/cohort'

interface CohortHeatmapProps {
  data: CohortMatrix
}

export function CohortHeatmap({ data }: CohortHeatmapProps) {
  const heatmapData = data.rows.map((row) => ({
    id: `${row.goLiveMonth} (${row.firmCount})`,
    data: data.months.map((month) => {
      const cell = row.cells.find((c) => c.observedMonth === month)
      return {
        x: month,
        y: cell && cell.gpvValue > 0 ? cell.gpvValue : null,
      }
    }),
  }))

  return (
    <ChartContainer
      title="Scale Plus - Cohort Analizi"
      height={450}
    >
      <HeatmapChart
        data={heatmapData}
        formatValue={(v) => formatCompactNumber(v)}
      />
    </ChartContainer>
  )
}
