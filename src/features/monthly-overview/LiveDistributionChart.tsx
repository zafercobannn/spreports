import { ChartContainer } from '@/components/charts/ChartContainer'
import { ResponsiveBar } from '@nivo/bar'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import type { MonthlyGPV } from '@/types/gpv'

interface LiveDistributionChartProps {
  data: MonthlyGPV
}

export function LiveDistributionChart({ data }: LiveDistributionChartProps) {
  const liveSpCount = Math.max(0, data.liveSPCount)
  const chartData = [
    { kategori: 'Toplam Live', adet: data.monthlyLiveCount },
    { kategori: 'Canlı SP', adet: liveSpCount },
    { kategori: 'Premium Onboarding', adet: data.premiumOnboardingLiveCount },
  ].sort((a, b) => b.adet - a.adet)

  const maxValue = Math.max(...chartData.map((item) => Number(item.adet) || 0), 10)
  const yMax = Math.ceil(maxValue * 1.1)

  return (
    <ChartContainer title="Live Dağılımı" height={320}>
      <ResponsiveBar
        data={chartData}
        keys={['adet']}
        indexBy="kategori"
        margin={{ top: 16, right: 24, bottom: 56, left: 64 }}
        padding={0.35}
        valueScale={{ type: 'linear', min: 0, max: yMax }}
        colors={['#f28a74']}
        borderRadius={6}
        enableLabel
        labelSkipWidth={0}
        labelSkipHeight={0}
        label={(d) => Number(d.value).toLocaleString('tr-TR')}
        labelTextColor="#2a3f47"
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
        theme={dashboardChartTheme}
        animate
        motionConfig="gentle"
      />
    </ChartContainer>
  )
}
