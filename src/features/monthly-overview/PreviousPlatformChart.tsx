import { useMemo, useState } from 'react'
import { ChartContainer } from '@/components/charts/ChartContainer'
import type { PlatformCount } from '@/types/gpv'
import { formatNumber, formatPercent } from '@/utils/format'

interface PreviousPlatformChartProps {
  data: PlatformCount[]
  title?: string
}

function toLogoSlug(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function PlatformLogo({
  platformName,
}: {
  platformName: string
}) {
  const [isError, setIsError] = useState(false)
  const logoSrc = `/images/${toLogoSlug(platformName)}.png`

  if (isError) {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground">
        {getInitials(platformName)}
      </span>
    )
  }

  return (
    <img
      src={logoSrc}
      alt={platformName}
      className="h-10 w-10 shrink-0 rounded-lg border border-border/70 bg-white object-cover p-1"
      loading="lazy"
      onError={() => setIsError(true)}
    />
  )
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
            <div className="flex min-w-0 items-center gap-2">
              <PlatformLogo platformName={platform.name} />
              <span className="truncate text-sm font-medium text-foreground">{platform.name}</span>
            </div>
            <span className="text-right text-xs font-semibold text-primary">
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
