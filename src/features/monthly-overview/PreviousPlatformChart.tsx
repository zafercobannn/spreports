import { useMemo, useState } from 'react'
import { animated } from '@react-spring/web'
import type { DefaultRawDatum, PieSvgProps } from '@nivo/pie'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { PieChart } from '@/components/charts/PieChart'
import type { PlatformCount } from '@/types/gpv'
import { formatPercent } from '@/utils/format'

interface PreviousPlatformChartProps {
  data: PlatformCount[]
}

interface PlatformPieDatum extends DefaultRawDatum {
  label: string
  logoSrc: string
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

function PlatformLogo({ platformName }: { platformName: string }) {
  const [isError, setIsError] = useState(false)
  const imageSrc = useMemo(() => `/images/${toLogoSlug(platformName)}.png`, [platformName])

  if (isError) {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground">
        {getInitials(platformName)}
      </span>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={platformName}
      className="h-10 w-10 shrink-0 rounded-lg border border-border/70 bg-white object-cover p-1"
      loading="lazy"
      onError={() => setIsError(true)}
    />
  )
}

export function PreviousPlatformChart({ data }: PreviousPlatformChartProps) {
  const total = data.reduce((sum, platform) => sum + Math.max(0, platform.count), 0)

  const chartData: PlatformPieDatum[] = total > 0
    ? data
      .filter((platform) => platform.count > 0)
      .map((platform) => ({
        id: platform.name,
        label: platform.name,
        value: (platform.count / total) * 100,
        logoSrc: `/images/${toLogoSlug(platform.name)}.png`,
      }))
    : [{ id: 'veri-yok', label: 'Veri Yok', value: 100, logoSrc: '/images/veri-yok.png' }]

  const sortedPlatforms = [...chartData]
    .sort((a, b) => Number(b.value) - Number(a.value))
    .filter((item) => item.id !== 'veri-yok')

  const arcLabelsComponent: NonNullable<PieSvgProps<PlatformPieDatum>['arcLabelsComponent']> = ({
    datum,
    style,
  }) => (
    <animated.g opacity={style.progress}>
      <animated.g transform={style.transform}>
        <rect
          x={-16}
          y={-16}
          width={32}
          height={32}
          rx={8}
          ry={8}
          fill="#ffffff"
          stroke="#c4d8df"
          strokeWidth={1}
        />
        <text
          x={0}
          y={0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={700}
          fill="#6f8892"
        >
          {getInitials(datum.label?.toString() ?? '')}
        </text>
        <image
          href={datum.data.logoSrc}
          x={-13}
          y={-13}
          width={26}
          height={26}
          preserveAspectRatio="xMidYMid meet"
        />
      </animated.g>
    </animated.g>
  )

  return (
    <ChartContainer
      title="Önceki Platform Dağılımı"
      height={420}
    >
      <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-h-0">
          <PieChart
            data={chartData}
            valueFormat={(value) => `${Number(value).toFixed(1)}%`}
            arcLabel={() => ''}
            arcLabelsComponent={arcLabelsComponent}
            arcLinkLabel={(item) => `${Number(item.value).toFixed(1)}%`}
          />
        </div>
        <div className="space-y-2 overflow-y-auto pr-1">
          {sortedPlatforms.map((platform) => (
            <div
              key={String(platform.id)}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-white/75 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <PlatformLogo platformName={String(platform.label)} />
                <span className="truncate text-sm font-medium text-foreground">{String(platform.label)}</span>
              </div>
              <span className="text-xs font-semibold text-primary">{formatPercent(Number(platform.value))}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  )
}
