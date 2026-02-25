import { ResponsiveLine } from '@nivo/line'
import { dashboardChartTheme, chartColors } from './chart-theme'

interface DataPoint {
  x: string | number
  y: number
}

interface SerieData {
  id: string
  data: DataPoint[]
}

interface LineChartProps {
  data: SerieData[]
  margin?: { top: number; right: number; bottom: number; left: number }
  curve?: 'linear' | 'monotoneX' | 'step'
  enablePoints?: boolean
  enableArea?: boolean
  colors?: string[]
}

export function LineChart({
  data,
  margin = { top: 10, right: 20, bottom: 40, left: 60 },
  curve = 'monotoneX',
  enablePoints = true,
  enableArea = false,
  colors = chartColors.primary,
}: LineChartProps) {
  return (
    <ResponsiveLine
      data={data}
      margin={margin}
      curve={curve}
      enablePoints={enablePoints}
      enableArea={enableArea}
      pointSize={8}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      useMesh
      colors={colors}
      theme={dashboardChartTheme}
      animate
      motionConfig="gentle"
    />
  )
}
