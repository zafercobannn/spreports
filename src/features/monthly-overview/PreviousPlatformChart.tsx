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

  return (
    <ChartContainer
      title={title}
      height={420}
    >
      <div className="h-full space-y-2 overflow-y-auto pr-1">
        {sortedPlatforms.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-white/75 px-3 py-2"
          >
            <span className="truncate text-sm font-medium text-foreground">{platform.name}</span>
            <span className="shrink-0 text-right text-xs font-semibold text-primary">
              {formatNumber(platform.count)} adet
              <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                ({formatPercent(total > 0 ? (platform.count / total) * 100 : 0)})
              </span>
            </span>
          </div>
        ))}
        {sortedPlatforms.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 bg-white/75 px-3 py-8 text-center text-sm text-muted-foreground">
            Veri yok
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
