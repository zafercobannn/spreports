import { ResponsiveHeatMap } from '@nivo/heatmap'
import type { HeatMapSvgProps, HeatMapDatum } from '@nivo/heatmap'
import { dashboardChartTheme } from './chart-theme'

interface HeatmapDataItem {
  id: string
  data: { x: string; y: number | null }[]
}

type HeatmapChartProps = Partial<HeatMapSvgProps<HeatMapDatum, Record<string, unknown>>> & {
  data: HeatmapDataItem[]
  formatValue?: (value: number) => string
}

export function HeatmapChart({
  data,
  formatValue,
  ...rest
}: HeatmapChartProps) {
  return (
    <ResponsiveHeatMap
      data={data as never}
      margin={{ top: 60, right: 30, bottom: 30, left: 100 }}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
      }}
      colors={{
        type: 'quantize',
        colors: ['#f0ffaa', '#deff5c', '#d2f547', '#bce035', '#a8c428', '#7d971c'],
      }}
      emptyColor="var(--color-surface-muted)"
      borderRadius={6}
      borderWidth={1}
      borderColor="var(--color-border)"
      labelTextColor="#1a1a1d"
      theme={{
        ...dashboardChartTheme,
        labels: {
          text: { fontSize: 14, fontWeight: 700 },
        },
      }}
      animate
      motionConfig="gentle"
      label={(d) => {
        const val = d.value
        if (val === null || val === undefined) return ''
        return formatValue ? formatValue(val) : String(val)
      }}
      {...rest}
    />
  )
}
