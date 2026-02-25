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
        colors: ['#fbfee9', '#f6ffd5', '#f1ffc0', '#ecffac', '#e7ff98', '#e2ff72', '#deff36', '#c0dd34'],
      }}
      emptyColor="#f8faee"
      borderRadius={4}
      borderWidth={2}
      borderColor="#edf3cf"
      labelTextColor={{ from: 'color', modifiers: [['darker', 2.2]] }}
      theme={dashboardChartTheme}
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
