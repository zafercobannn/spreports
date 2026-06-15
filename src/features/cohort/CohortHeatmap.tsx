import { ChartContainer } from '@/components/charts/ChartContainer'
import { HeatmapChart } from '@/components/charts/HeatmapChart'
import type { CohortMatrix } from '@/types/cohort'

interface CohortHeatmapProps {
  data: CohortMatrix
}

// Yuvarlamadan, kısaltılmış biçimde 2 ondalık gösterir (örn. 20,17M).
function formatCohortCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2).replace('.', ',')}K`
  return value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
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
        formatValue={(v) => formatCohortCompact(v)}
      />
    </ChartContainer>
  )
}
