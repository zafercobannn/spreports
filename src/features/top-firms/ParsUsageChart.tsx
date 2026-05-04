import { ChartContainer } from '@/components/charts/ChartContainer'
import { PieChart } from '@/components/charts/PieChart'
import type { TopFirm } from '@/types/firms'
import { formatNumber, formatPercent } from '@/utils/format'

interface ParsUsageChartProps {
  data: TopFirm[]
}

export function ParsUsageChart({ data }: ParsUsageChartProps) {
  const usingPars = data.filter((f) => f.usesPars).length
  const totalFirmCount = data.length
  const notUsingPars = Math.max(0, totalFirmCount - usingPars)
  const hasData = totalFirmCount > 0

  const chartData = hasData
    ? [
        { id: 'PARS Kullanan', label: 'Kullanan', value: usingPars },
        { id: 'PARS Kullanmayan', label: 'Kullanmayan', value: notUsingPars },
      ]
    : [{ id: 'Veri Yok', label: 'Veri Yok', value: 1 }]

  return (
    <ChartContainer
      title="PARS Kullanım Oranı"
      subtitle="Top 15 firma bazında kullanan/kullanmayan yüzdesi"
      height={280}
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          <PieChart
            data={chartData}
            colors={hasData ? ['#3d8d86', '#dcdee2'] : ['#dcdee2']}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            tooltip={({ datum }) => {
              if (!hasData || totalFirmCount === 0) {
                return (
                  <div className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-[11px] text-foreground shadow-md">
                    <p className="font-semibold text-foreground">Veri Yok</p>
                  </div>
                )
              }

              const count = Number(datum.value)
              const percent = (count / totalFirmCount) * 100
              return (
                <div className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-[11px] text-foreground shadow-md">
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
                <span className="h-2 w-2 rounded-full bg-[var(--color-chart)]" />
                <span className="text-muted-foreground">Kullanan</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatNumber(usingPars)} firma ({formatPercent((usingPars / totalFirmCount) * 100)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border border-border bg-track" />
                <span className="text-muted-foreground">Kullanmayan</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatNumber(notUsingPars)} firma ({formatPercent((notUsingPars / totalFirmCount) * 100)})
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
