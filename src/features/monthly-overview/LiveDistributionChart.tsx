import { ChartContainer } from '@/components/charts/ChartContainer'
import { ResponsiveLine, type LineSeries } from '@nivo/line'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import type { MonthlyGPV } from '@/types/gpv'

interface LiveDistributionChartProps {
  data: MonthlyGPV
}

export function LiveDistributionChart({ data }: LiveDistributionChartProps) {
  const chartData: LineSeries = {
    id: 'Live Dağılımı',
    data: [
      { x: 'Toplam Live', y: data.monthlyLiveCount },
      { x: 'SP', y: data.totalSP },
      { x: 'Premium Onboarding', y: data.premiumOnboardingLiveCount },
    ],
  }

  const maxValue = Math.max(...chartData.data.map((item) => Number(item.y) || 0), 10)
  const yMax = Math.ceil(maxValue * 1.1)

  return (
    <ChartContainer title="Live Dağılımı" height={320}>
      <ResponsiveLine
        data={[chartData]}
        margin={{ top: 16, right: 24, bottom: 56, left: 64 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: yMax, stacked: false, reverse: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 12,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          format: (value) => Number(value).toLocaleString('tr-TR'),
        }}
        enableGridX={false}
        enableGridY
        curve="linear"
        lineWidth={2}
        colors={['#f28a74']}
        pointSize={7}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor="#f28a74"
        enablePointLabel
        pointLabel="data.yFormatted"
        pointLabelYOffset={-12}
        yFormat=" >-.0f"
        enableArea={false}
        enableSlices={false}
        useMesh
        theme={{
          ...dashboardChartTheme,
          labels: {
            text: {
              fontSize: 12,
              fontWeight: 700,
              fill: '#2a3f47',
            },
          },
        }}
        animate
        motionConfig="gentle"
      />
    </ChartContainer>
  )
}
