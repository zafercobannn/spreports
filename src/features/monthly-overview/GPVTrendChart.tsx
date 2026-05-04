import { useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import { useFilters } from '@/hooks/use-filters'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import { TURKISH_MONTHS } from '@/utils/date-utils'
import { formatCompactCurrency } from '@/utils/format'

export function GPVTrendChart() {
  const { year, month } = useFilters()
  const periods = useDashboardDataStore((s) => s.periods)

  const { lineData, isEmpty } = useMemo(() => {
    const allKeys = Object.keys(periods).sort()
    if (allKeys.length === 0) return { lineData: [], isEmpty: true }

    // Only include months that actually have data (spGPV > 0 OR ikasGPV > 0).
    // Empty/placeholder periods (e.g. a future month with no values yet) are skipped.
    const slice = allKeys.filter((key) => {
      const p = periods[key]?.monthlyGPV
      if (!p) return false
      return (p.spGPV ?? 0) > 0 || (p.ikasGPV ?? 0) > 0
    })

    const buildPoint = (key: string, value: number) => {
      const monthIdx = Number(key.split('-')[1] ?? 0) - 1
      const label = `${TURKISH_MONTHS[monthIdx]?.slice(0, 3) ?? ''} ${key.slice(2, 4)}`
      return { x: label, y: value }
    }

    const spPoints = slice
      .map((key) => {
        const v = periods[key]?.monthlyGPV?.spGPV ?? 0
        return v > 0 ? buildPoint(key, v) : null
      })
      .filter((v): v is { x: string; y: number } => v !== null)

    const ikasPoints = slice
      .map((key) => {
        const v = periods[key]?.monthlyGPV?.ikasGPV ?? 0
        return v > 0 ? buildPoint(key, v) : null
      })
      .filter((v): v is { x: string; y: number } => v !== null)

    return {
      lineData: [
        { id: 'SP GPV', data: spPoints, color: 'var(--color-chart)' },
        { id: 'ikas GPV', data: ikasPoints, color: 'var(--color-chart-2)' },
      ],
      isEmpty: spPoints.length < 2 && ikasPoints.length < 2,
    }
  }, [periods, year, month])

  return (
    <ChartContainer
      title="GPV Trendi"
      subtitle="SP GPV ve toplam ikas GPV karşılaştırması"
      height={280}
      isEmpty={isEmpty}
      actions={
        <div className="flex items-center gap-3.5 text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#a8c428]" />
            <span className="font-medium text-foreground">SP GPV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a1a1d]" />
            <span className="font-medium text-foreground">ikas GPV</span>
          </div>
        </div>
      }
    >
      <ResponsiveLine
        data={lineData}
        margin={{ top: 16, right: 24, bottom: 36, left: 56 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
        curve="monotoneX"
        enableArea
        areaOpacity={0.10}
        colors={['#a8c428', '#1a1a1d']}
        lineWidth={2.5}
        enablePoints
        pointSize={6}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointColor="#ffffff"
        useMesh
        gridYValues={5}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          format: (v) => formatCompactCurrency(Number(v)).replace(/\s?₺/, ''),
        }}
        axisBottom={{ tickSize: 0, tickPadding: 12 }}
        theme={dashboardChartTheme}
        animate
        motionConfig="gentle"
      />
    </ChartContainer>
  )
}
