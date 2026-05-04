import { ChartContainer } from '@/components/charts/ChartContainer'
import { PieChart } from '@/components/charts/PieChart'
import type { TopFirm } from '@/types/firms'
import { formatNumber, formatPercent } from '@/utils/format'

interface PwiUsageChartProps {
  data: TopFirm[]
}

export function PwiUsageChart({ data }: PwiUsageChartProps) {
  const firmsUsingPwi = data.filter((firm) => firm.usesPwi)
  const firmsNotUsingPwi = data.filter((firm) => !firm.usesPwi)
  const usingPwi = firmsUsingPwi.length
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
              const firms =
                datum.id === 'PWI Kullanan' ? firmsUsingPwi : firmsNotUsingPwi

              return (
                <div className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-[11px] text-foreground shadow-md max-h-64 overflow-y-auto">
                  <p className="font-semibold text-foreground">{datum.label}</p>
                  <p className="text-muted-foreground mb-2">
                    {formatNumber(count)} firma ({formatPercent(percent)})
                  </p>
                  {firms.length > 0 && (
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="py-1 pr-3 font-medium text-muted-foreground">#</th>
                          <th className="py-1 font-medium text-muted-foreground">Mağaza</th>
                        </tr>
                      </thead>
                      <tbody>
                        {firms.map((firm, i) => (
                          <tr key={firm.name} className="border-b border-border/30 last:border-0">
                            <td className="py-1 pr-3 text-muted-foreground">{i + 1}</td>
                            <td className="py-1 text-foreground">{firm.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
                {formatNumber(usingPwi)} firma ({formatPercent((usingPwi / totalFirmCount) * 100)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border border-border bg-track" />
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
