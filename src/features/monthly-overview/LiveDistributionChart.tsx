import { ChartContainer } from '@/components/charts/ChartContainer'
import { ResponsiveBar } from '@nivo/bar'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import { formatNumber } from '@/utils/format'
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
    <ChartContainer title="Live Dağılımı" subtitle="Aylık live, canlı SP ve premium onboarding karşılaştırması" height={300}>
      <ResponsiveBar
        data={chartData}
        keys={['adet']}
        indexBy="kategori"
        margin={{ top: 12, right: 16, bottom: 44, left: 56 }}
        padding={0.4}
        valueScale={{ type: 'linear', min: 0, max: yMax }}
        colors={['#3d8d86']}
        borderRadius={3}
        enableLabel
        labelSkipWidth={0}
        labelSkipHeight={0}
        label={(d) => formatNumber(Number(d.value))}
        labelTextColor="var(--color-foreground)"
        axisTop={null}
        axisRight={null}
        axisBottom={{ tickSize: 0, tickPadding: 10 }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          format: (value) => formatNumber(Number(value)),
        }}
        enableGridY
        gridYValues={5}
        theme={dashboardChartTheme}
        animate
        motionConfig="gentle"
      />
    </ChartContainer>
  )
}
