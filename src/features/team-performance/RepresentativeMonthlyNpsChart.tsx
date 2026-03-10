import { useEffect, useMemo } from 'react'
import { ResponsiveBar, type BarCustomLayer, type BarDatum } from '@nivo/bar'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import { buildRollingPeriodWindow, useDashboardDataStore } from '@/stores/dashboard-data-store'

interface RepresentativeMonthlyNpsChartProps {
  year: number
  month: number
}

interface MonthTooltipMeta {
  monthLabel: string
  scores: Array<{ name: string; value: number }>
  average: number | null
}

const REPRESENTATIVE_COLORS = [
  '#f2c078',
  '#9f88d9',
  '#e78bb7',
  '#f39d82',
  '#65c7cf',
  '#78b889',
  '#7d9ec2',
  '#d98c6c',
  '#c59cd8',
  '#86b8a5',
]

function formatDays(value: number): string {
  return `${value.toFixed(1)} gün`
}

export function RepresentativeMonthlyNpsChart({
  year,
  month,
}: RepresentativeMonthlyNpsChartProps) {
  const periods = useDashboardDataStore((s) => s.periods)
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const rollingWindow = useMemo(
    () => buildRollingPeriodWindow(year, month, 7),
    [year, month],
  )

  useEffect(() => {
    rollingWindow.forEach((item) => {
      ensurePeriod(item.year, item.month)
    })
  }, [ensurePeriod, rollingWindow])

  const representativeNames = useMemo(() => {
    const uniqueNames = new Set<string>()
    rollingWindow.forEach((item) => {
      const reps = periods[item.key]?.representativeSuccess ?? []
      reps.forEach((rep) => {
        if (!rep.name.trim()) return
        if (rep.avgGoLiveDurationDays <= 0) return
        uniqueNames.add(rep.name.trim())
      })
    })

    return Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [periods, rollingWindow])

  const representativeColorMap = useMemo(() => {
    const map = new Map<string, string>()
    representativeNames.forEach((name, idx) => {
      map.set(name, REPRESENTATIVE_COLORS[idx % REPRESENTATIVE_COLORS.length])
    })
    return map
  }, [representativeNames])

  const { chartData, monthTooltipMeta, hasAnyData, maxDurationScale } = useMemo(() => {
    const tooltipMeta = new Map<string, MonthTooltipMeta>()

    const rows = rollingWindow.map((item) => {
      const period = periods[item.key]
      const scores = (period?.representativeSuccess ?? [])
        .filter((rep) => rep.name.trim().length > 0)
        .map((rep) => ({
          name: rep.name.trim(),
          value: Math.max(0, Number(rep.avgGoLiveDurationDays)),
        }))
        .filter((entry) => entry.value > 0)
      const scoresByName = new Map(scores.map((entry) => [entry.name, entry.value] as const))
      const avg = scores.length > 0
        ? scores.reduce((sum, score) => sum + score.value, 0) / scores.length
        : null

      tooltipMeta.set(item.label, {
        monthLabel: item.label,
        scores,
        average: avg,
      })

      const row: Record<string, string | number> = {
        ay: item.label,
      }

      representativeNames.forEach((name) => {
        row[name] = scoresByName.get(name) ?? 0
      })

      return row as BarDatum
    })

    const maxValue = Array.from(tooltipMeta.values()).reduce((max, item) => {
      const scoreMax = item.scores.reduce((innerMax, score) => Math.max(innerMax, score.value), 0)
      const avgMax = item.average ?? 0
      return Math.max(max, scoreMax, avgMax)
    }, 0)

    const safeMaxScale = Math.max(10, Math.ceil(maxValue))
    const hasData = Array.from(tooltipMeta.values()).some((meta) => meta.scores.length > 0)

    return {
      chartData: rows,
      monthTooltipMeta: tooltipMeta,
      hasAnyData: hasData,
      maxDurationScale: safeMaxScale,
    }
  }, [periods, representativeNames, rollingWindow])

  const averageLineLayer = useMemo<BarCustomLayer<BarDatum>>(
    () =>
      ({
        bars,
        innerHeight,
        innerWidth,
      }) => {
        const points: Array<{ x: number; y: number; average: number }> = []
        const emptyMonthCenters: number[] = []

        const resolveCenterX = (monthLabel: string): number | null => {
          const monthBars = bars.filter(
            (bar) => String(bar.data.indexValue) === monthLabel,
          )

          if (monthBars.length > 0) {
            const left = Math.min(...monthBars.map((bar) => bar.x))
            const right = Math.max(...monthBars.map((bar) => bar.x + bar.width))
            return left + (right - left) / 2
          }

          const periodIndex = rollingWindow.findIndex((item) => item.label === monthLabel)
          if (periodIndex < 0) return null
          return ((periodIndex + 0.5) * innerWidth) / rollingWindow.length
        }

        rollingWindow.forEach((periodItem) => {
          const meta = monthTooltipMeta.get(periodItem.label)
          const centerX = resolveCenterX(periodItem.label)
          if (centerX === null) return
          if (!meta || meta.average === null) {
            emptyMonthCenters.push(centerX)
            return
          }

          points.push({
            x: centerX,
            y: innerHeight - (Math.max(0, meta.average) / maxDurationScale) * innerHeight,
            average: meta.average,
          })
        })

        const linePath = points
          .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
          .join(' ')

        const rightAxisTicks = Array.from({ length: 6 }, (_, idx) => (maxDurationScale / 5) * idx)

        return (
          <g>
            <line x1={innerWidth} y1={0} x2={innerWidth} y2={innerHeight} stroke="#6f8892" strokeWidth={1} />
            {rightAxisTicks.map((value) => {
              const y = innerHeight - (value / maxDurationScale) * innerHeight
              return (
                <g key={value}>
                  <line x1={innerWidth} y1={y} x2={innerWidth + 6} y2={y} stroke="#6f8892" strokeWidth={1} />
                  <text x={innerWidth + 10} y={y + 4} fontSize={11} fill="#516770">
                    {value.toFixed(0)}
                  </text>
                </g>
              )
            })}
            <text x={innerWidth + 42} y={14} textAnchor="middle" fontSize={11} fill="#405662" fontWeight={600}>
              Ort. Süre (gün)
            </text>

            {points.length > 0 && (
              <>
                <path d={linePath} fill="none" stroke="#496275" strokeWidth={2.2} />
                {points.map((point) => (
                  <circle
                    key={`${point.x}-${point.y}`}
                    cx={point.x}
                    cy={point.y}
                    r={3.8}
                    fill="#ffffff"
                    stroke="#496275"
                    strokeWidth={2}
                  />
                ))}
              </>
            )}
            {emptyMonthCenters.map((centerX, idx) => (
              <text
                key={`empty-month-${idx}`}
                x={centerX}
                y={innerHeight - 6}
                textAnchor="middle"
                fontSize={10}
                fill="#7d8f97"
              >
                Veri yok
              </text>
            ))}
          </g>
        )
      },
    [maxDurationScale, monthTooltipMeta, rollingWindow],
  )

  return (
    <ChartContainer
      title="Canlıya Alma Süreci - Ortalama Canlıya Alma Süresi"
      subtitle="Temsilci bazlı ortalama canlıya alma süresi (gün) - seçili ay dahil son 7 ay"
      height={420}
      isEmpty={!hasAnyData || representativeNames.length === 0}
    >
      <ResponsiveBar
        data={chartData}
        keys={representativeNames}
        indexBy="ay"
        groupMode="stacked"
        margin={{ top: 24, right: 96, bottom: 56, left: 74 }}
        padding={0.28}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={({ id }) => representativeColorMap.get(String(id)) ?? '#8aa9b6'}
        borderRadius={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
          legend: 'Ay',
          legendOffset: 42,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          legend: 'Temsilci Süre Toplamı (Gün, Stacked)',
          legendOffset: -58,
          legendPosition: 'middle',
        }}
        tooltip={({ data, color }) => {
          const monthLabel = String(data.ay ?? '')
          const meta = monthTooltipMeta.get(monthLabel)
          if (!meta || meta.scores.length === 0) {
            return (
              <div className="rounded-lg border border-border/80 bg-white px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-foreground">{monthLabel}</p>
                <p className="text-muted-foreground">Veri yok</p>
              </div>
            )
          }

          return (
            <div className="min-w-[220px] rounded-lg border border-border/80 bg-white px-3 py-2 text-xs shadow-md">
              <p className="mb-1 font-semibold text-foreground">{monthLabel}</p>
              {meta.scores.map((score) => (
                <div key={`${monthLabel}-${score.name}`} className="flex items-center justify-between gap-3">
                  <span className="truncate text-muted-foreground">{score.name}</span>
                  <span className="font-semibold text-foreground">{formatDays(score.value)}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-border/70 pt-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Ay Ortalaması</span>
                  <span className="font-semibold" style={{ color }}>
                    {meta.average !== null ? formatDays(meta.average) : '-'}
                  </span>
                </div>
              </div>
            </div>
          )
        }}
        theme={dashboardChartTheme}
        enableLabel={false}
        animate
        motionConfig="gentle"
        layers={['grid', 'axes', 'bars', averageLineLayer]}
      />
    </ChartContainer>
  )
}
