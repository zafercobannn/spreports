import { ChartContainer } from '@/components/charts/ChartContainer'
import { PieChart } from '@/components/charts/PieChart'
import type { TopFirm } from '@/types/firms'
import { formatNumber, formatPercent } from '@/utils/format'

interface PwiUsageChartProps {
  data: TopFirm[]
}

export function PwiUsageChart({ data }: PwiUsageChartProps) {
  const usingPwi = data.filter((firm) => firm.usesPwi).length
  const totalFirmCount = data.length
  const notUsingPwi = Math.max(0, totalFirmCount - usingPwi)
  const hasData = totalFirmCount > 0

  const chartData = hasData
    ? [
        { id: 'PWI Kullanan', label: 'Kullanan', value: usingPwi },
        { id: 'PWI Kullanmayan', label: 'Kullanmayan', value: notUsingPwi },
      ]
    : [{ id: 'Veri Yok', label: 'Veri Yok', value: 1 }]

  return (
    <ChartContainer
      title="PWI Kullanım Oranı"
      subtitle="Top 15 firma bazında kullanan/kullanmayan yüzdesi"
      height={280}
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          <PieChart
            data={chartData}
            colors={hasData ? ['#16a34a', '#ef4444'] : ['#9aa7ad']}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            tooltip={({ datum }) => {
              if (!hasData || totalFirmCount === 0) {
                return (
                  <div className="rounded-lg border border-border/80 bg-white px-3 py-2 text-xs shadow-md">
                    <p className="font-semibold text-foreground">Veri Yok</p>
                  </div>
                )
              }

              const count = Number(datum.value)
              const percent = (count / totalFirmCount) * 100
              return (
                <div className="rounded-lg border border-border/80 bg-white px-3 py-2 text-xs shadow-md">
                  <p className="font-semibold text-foreground">{datum.label}</p>
                  <p className="text-muted-foreground">{formatNumber(count)} firma</p>
                  <p className="text-muted-foreground">{formatPercent(percent)}</p>
                </div>
              )
            }}
          />
        </div>

        {hasData && (
          <div className="grid grid-cols-1 gap-1.5 border-t border-border/60 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
                <span className="text-muted-foreground">Kullanan</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatNumber(usingPwi)} firma ({formatPercent((usingPwi / totalFirmCount) * 100)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-muted-foreground">Kullanmayan</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatNumber(notUsingPwi)} firma ({formatPercent((notUsingPwi / totalFirmCount) * 100)})
              </span>
            </div>
          </div>
        )}

        {!hasData && (
          <div className="border-t border-border/60 pt-2 text-center text-xs text-muted-foreground">
            Veri yok
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
