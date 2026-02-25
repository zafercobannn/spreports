import { ResponsiveBar } from '@nivo/bar'
import type { BarDatum } from '@nivo/bar'
import { dashboardChartTheme, chartColors } from './chart-theme'

interface BarChartProps {
  data: BarDatum[]
  keys: string[]
  indexBy: string
  groupMode?: 'grouped' | 'stacked'
  layout?: 'vertical' | 'horizontal'
  margin?: { top: number; right: number; bottom: number; left: number }
  enableLabel?: boolean
  colors?: string[]
  labelTextColor?: string
}

export function BarChart({
  data,
  keys,
  indexBy,
  groupMode = 'grouped',
  layout = 'vertical',
  margin = { top: 10, right: 20, bottom: 40, left: 60 },
  enableLabel = false,
  colors = chartColors.primary,
  labelTextColor,
}: BarChartProps) {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      groupMode={groupMode}
      layout={layout}
      margin={margin}
      padding={0.3}
      enableLabel={enableLabel}
      colors={colors}
      labelTextColor={labelTextColor}
      theme={dashboardChartTheme}
      borderRadius={4}
      animate
      motionConfig="gentle"
    />
  )
}
