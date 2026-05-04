import { useMemo } from 'react'
import { ChartContainer } from '@/components/charts/ChartContainer'
import type { PlatformCount } from '@/types/gpv'
import { formatNumber, formatPercent } from '@/utils/format'

interface PreviousPlatformChartProps {
  data: PlatformCount[]
  title?: string
}

export function PreviousPlatformChart({ data, title = 'Önceki Platform Dağılımı' }: PreviousPlatformChartProps) {
  const total = data.reduce((sum, platform) => sum + Math.max(0, platform.count), 0)

  const sortedPlatforms = useMemo(
    () => [...data]
      .filter((platform) => platform.count > 0)
      .sort((a, b) => b.count - a.count),
    [data],
  )

  const max = sortedPlatforms[0]?.count ?? 1

  return (
    <ChartContainer
      title={title}
      subtitle={`Toplam ${formatNumber(total)} firma`}
      height={420}
    >
      <div className="h-full space-y-2.5 overflow-y-auto pr-1">
        {sortedPlatforms.map((platform, idx) => {
          const pct = total > 0 ? (platform.count / total) * 100 : 0
          const barPct = max > 0 ? (platform.count / max) * 100 : 0
          return (
            <div key={platform.name} className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground">{platform.name}</span>
                <span className="font-mono tabular text-muted-foreground">
                  {formatNumber(platform.count)}
                  <span className="ml-1.5 text-subtle">{formatPercent(pct)}</span>
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-track">
                <div
                  className="bar-grow absolute inset-y-0 left-0 bg-[var(--color-chart)]"
                  style={{ width: `${barPct}%`, animationDelay: `${idx * 60}ms` }}
                />
              </div>
            </div>
          )
        })}
        {sortedPlatforms.length === 0 && (
          <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-[12px] text-muted-foreground">
            Veri yok
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
