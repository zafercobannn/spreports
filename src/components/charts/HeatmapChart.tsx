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
        colors: ['#d6e7d1', '#bddab2', '#9ac88a', '#75b35f', '#4d953a', '#2f7a1f'],
      }}
      emptyColor="#d6d7db"
      borderRadius={4}
      borderWidth={1}
      borderColor="#eceef1"
      labelTextColor="#f8fafc"
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
