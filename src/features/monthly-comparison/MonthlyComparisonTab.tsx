import { useEffect, useMemo, type ReactElement } from 'react'
import { ResponsiveBar, type BarCustomLayerProps, type BarDatum } from '@nivo/bar'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { PageSection } from '@/components/layout/PageSection'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import { getMonthName } from '@/utils/date-utils'
import { formatNumber } from '@/utils/format'

type MetricValueType = 'k' | 'number'

interface ComparisonMetric {
  id: string
  label: string
  valueType: MetricValueType
  previousValue: number
  currentValue: number
}

interface ManualShares {
  previousGpvShare: number
  currentGpvShare: number
  previousShikasShare: number
  currentShikasShare: number
  previousLiveSPShare: number
  currentLiveSPShare: number
}

interface ComparisonBarDatum extends BarDatum {
  metric: string
  valueType: MetricValueType
  previous: number
  current: number
  previousRaw: number
  currentRaw: number
  previousShare: number
  currentShare: number
}

const PREVIOUS_COLOR = 'var(--color-muted-foreground)'
const CURRENT_COLOR = 'var(--color-chart)'

function getOffsetPeriod(year: number, month: number, offset: number): { year: number; month: number } {
  let nextYear = year
  let nextMonth = month + offset

  while (nextMonth < 1) {
    nextMonth += 12
    nextYear -= 1
  }

  while (nextMonth > 12) {
    nextMonth -= 12
    nextYear += 1
  }

  return { year: nextYear, month: nextMonth }
}

function formatAsK(value: number): string {
  if (value <= 0) return '0'
  if (value < 1000) return formatNumber(Math.round(value))
  const divided = Math.round(value / 1000)
  let suffix = 'K'
  if (divided >= 1_000_000) suffix = 'B'
  else if (divided >= 1000) suffix = 'M'
  return `${formatNumber(divided)} ${suffix}`
}

function formatComparisonValue(value: number, type: MetricValueType): string {
  if (type === 'k') {
    return formatAsK(value)
  }
  return formatNumber(Math.round(value))
}

function formatPercent(value: number): string {
  return `%${value.toFixed(2)}`
}

const SHARE_KEYS: Record<string, { prev: keyof ManualShares; curr: keyof ManualShares }> = {
  'sp-gpv': { prev: 'previousGpvShare', curr: 'currentGpvShare' },
  shikas: { prev: 'previousShikasShare', curr: 'currentShikasShare' },
  'live-sp': { prev: 'previousLiveSPShare', curr: 'currentLiveSPShare' },
}

function buildChartRows(metrics: ComparisonMetric[], shares: ManualShares): ComparisonBarDatum[] {
  return metrics.map((metric) => {
    const pairMax = Math.max(metric.previousValue, metric.currentValue, 1)
    const keys = SHARE_KEYS[metric.id]

    const prevShare = keys ? shares[keys.prev] : 0
    const currShare = keys ? shares[keys.curr] : 0

    return {
      metric: metric.label,
      valueType: metric.valueType,
      previous: (metric.previousValue / pairMax) * 100,
      current: (metric.currentValue / pairMax) * 100,
      previousRaw: metric.previousValue,
      currentRaw: metric.currentValue,
      previousShare: prevShare,
      currentShare: currShare,
    }
  })
}

function createValueLabelLayer(): (props: BarCustomLayerProps<ComparisonBarDatum>) => ReactElement {
  return ({ bars }) => (
    <g>
      {bars.map((bar) => {
        const datum = bar.data.data as ComparisonBarDatum
        const isPrevious = String(bar.data.id) === 'previous'
        const rawValue = isPrevious ? datum.previousRaw : datum.currentRaw
        const label = formatComparisonValue(rawValue, datum.valueType)

        return (
          <text
            key={`value-${bar.key}-${String(bar.data.indexValue)}`}
            x={bar.x + bar.width / 2}
            y={bar.y - 8}
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill="var(--color-foreground)"
          >
            {label}
          </text>
        )
      })}
    </g>
  )
}

function createShareLabelLayer(): (props: BarCustomLayerProps<ComparisonBarDatum>) => ReactElement {
  return ({ bars }) => (
    <g>
      {bars.map((bar) => {
        if (bar.height < 24) return null

        const datum = bar.data.data as ComparisonBarDatum
        const isPrevious = String(bar.data.id) === 'previous'
        const shareValue = isPrevious ? datum.previousShare : datum.currentShare

        return (
          <text
            key={`share-${bar.key}-${String(bar.data.indexValue)}`}
            x={bar.x + bar.width / 2}
            y={bar.y + bar.height * 0.55}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={isPrevious ? '#ffffff' : '#ffffff'}
          >
            {formatPercent(shareValue)}
          </text>
        )
      })}
    </g>
  )
}

function createBarMonthLabelLayer(
  previousLabel: string,
  currentLabel: string,
): (props: BarCustomLayerProps<ComparisonBarDatum>) => ReactElement {
  return ({ bars, innerHeight }) => (
    <g>
      {bars.map((bar) => {
        const isPrevious = String(bar.data.id) === 'previous'
        const text = isPrevious ? previousLabel : currentLabel

        return (
          <text
            key={`month-${bar.key}-${String(bar.data.indexValue)}`}
            x={bar.x + bar.width / 2}
            y={innerHeight + 18}
            textAnchor="middle"
            fontSize={10}
            fontWeight={500}
            fill="var(--color-muted-foreground)"
          >
            {text}
          </text>
        )
      })}
    </g>
  )
}

export function MonthlyComparisonTab() {
  const { year, month } = useFilters()
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const currentKey = useMemo(() => getPeriodKey(year, month), [year, month])
  const currentPeriodData = useDashboardDataStore((s) => s.periods[currentKey])

  const previousPeriod = useMemo(() => getOffsetPeriod(year, month, -1), [year, month])
  const previousKey = useMemo(
    () => getPeriodKey(previousPeriod.year, previousPeriod.month),
    [previousPeriod.month, previousPeriod.year],
  )
  const previousPeriodData = useDashboardDataStore((s) => s.periods[previousKey])

  useEffect(() => {
    ensurePeriod(year, month)
    ensurePeriod(previousPeriod.year, previousPeriod.month)
  }, [ensurePeriod, month, previousPeriod.month, previousPeriod.year, year])

  const currentLabel = `${getMonthName(month)} ${year}`
  const previousLabel = `${getMonthName(previousPeriod.month)} ${previousPeriod.year}`

  const metrics = useMemo<ComparisonMetric[]>(() => {
    const currentMonthly = currentPeriodData?.monthlyGPV
    const previousMonthly = previousPeriodData?.monthlyGPV

    return [
      {
        id: 'sp-gpv',
        label: 'SP GPV',
        valueType: 'k',
        previousValue: Math.max(0, previousMonthly?.spGPV ?? 0),
        currentValue: Math.max(0, currentMonthly?.spGPV ?? 0),
      },
      {
        id: 'shikas',
        label: 'Shikas',
        valueType: 'k',
        previousValue: Math.max(0, previousMonthly?.shikasGPV ?? 0),
        currentValue: Math.max(0, currentMonthly?.shikasGPV ?? 0),
      },
      {
        id: 'live-sp',
        label: 'En az 1 kere ödeme almış',
        valueType: 'number',
        previousValue: Math.max(0, previousMonthly?.liveSPCount ?? 0),
        currentValue: Math.max(0, currentMonthly?.liveSPCount ?? 0),
      },
    ]
  }, [currentPeriodData?.monthlyGPV, previousPeriodData?.monthlyGPV])

  const hasAnyData = useMemo(
    () => metrics.some((metric) => metric.previousValue > 0 || metric.currentValue > 0),
    [metrics],
  )

  const manualShares = useMemo<ManualShares>(() => ({
    previousGpvShare: previousPeriodData?.monthlyGPV?.gpvShare ?? 0,
    currentGpvShare: currentPeriodData?.monthlyGPV?.gpvShare ?? 0,
    previousShikasShare: previousPeriodData?.monthlyGPV?.shikasShare ?? 0,
    currentShikasShare: currentPeriodData?.monthlyGPV?.shikasShare ?? 0,
    previousLiveSPShare: previousPeriodData?.monthlyGPV?.liveSPShare ?? 0,
    currentLiveSPShare: currentPeriodData?.monthlyGPV?.liveSPShare ?? 0,
  }), [previousPeriodData?.monthlyGPV, currentPeriodData?.monthlyGPV])

  const chartData = useMemo(() => buildChartRows(metrics, manualShares), [metrics, manualShares])
  const shareLabelLayer = useMemo(() => createShareLabelLayer(), [])
  const valueLabelLayer = useMemo(() => createValueLabelLayer(), [])
  const monthLabelLayer = useMemo(
    () => createBarMonthLabelLayer(previousLabel, currentLabel),
    [currentLabel, previousLabel],
  )

  return (
    <div className="space-y-6">
      {/* Mini metric cards — current vs previous deltas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {metrics.map((m, idx) => {
          const change =
            m.previousValue > 0
              ? ((m.currentValue - m.previousValue) / m.previousValue) * 100
              : 0
          const isUp = change >= 0
          const formatVal = (v: number) =>
            m.valueType === 'k' ? formatAsK(v) : formatNumber(Math.round(v))
          return (
            <div
              key={m.id}
              className={
                'bento-card relative overflow-hidden p-5 ' +
                (idx === 0 ? '' : '')
              }
            >
              {idx === 0 && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(150deg, var(--color-accent) 0%, var(--color-accent-soft) 60%, var(--color-surface-warm) 100%)',
                  }}
                />
              )}
              <div className="relative flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                    {m.label}
                  </span>
                  {m.previousValue > 0 && (
                    <span
                      className={
                        'rounded-full px-3 py-1 font-mono tabular text-[11px] font-semibold ' +
                        (isUp
                          ? 'bg-foreground text-background'
                          : 'bg-[var(--color-danger)] text-white')
                      }
                    >
                      {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="font-mono tabular text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
                  {formatVal(m.currentValue)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono tabular">
                    {previousLabel}: {formatVal(m.previousValue)}
                  </span>
                  <span className="font-mono tabular text-foreground">
                    {currentLabel}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <PageSection
        title="Önceki Ay Karşılaştırma"
        description={`${previousLabel} ve ${currentLabel} karşılaştırması`}
      >
        <ChartContainer height={470} isEmpty={!hasAnyData}>
          <div className="flex h-full flex-col">
            <div className="mb-3 flex flex-wrap items-center gap-5 px-2">
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-16 rounded-sm" style={{ backgroundColor: PREVIOUS_COLOR }} />
                <span className="text-base font-semibold text-foreground">{previousLabel}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-4 w-16 rounded-sm" style={{ backgroundColor: CURRENT_COLOR }} />
                <span className="text-base font-semibold text-foreground">{currentLabel}</span>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute top-4 bottom-12 left-2 w-px bg-border" />
              <div className="absolute right-0 bottom-12 left-2 h-px bg-border" />
              <ResponsiveBar
                data={chartData}
                keys={['previous', 'current']}
                indexBy="metric"
                groupMode="grouped"
                margin={{ top: 40, right: 16, bottom: 102, left: 26 }}
                padding={0.52}
                innerPadding={18}
                valueScale={{ type: 'linear', min: 0, max: 100 }}
                indexScale={{ type: 'band', round: true }}
                colors={[PREVIOUS_COLOR, CURRENT_COLOR]}
                borderRadius={2}
                axisTop={null}
                axisRight={null}
                axisLeft={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 34,
                  tickRotation: 0,
                }}
                enableGridY={false}
                enableLabel={false}
                isInteractive
                theme={dashboardChartTheme}
                animate
                motionConfig="gentle"
                tooltip={({ id, color, data }) => {
                  const row = data as unknown as ComparisonBarDatum
                  const isPrevious = id === 'previous'
                  const rawValue = isPrevious ? row.previousRaw : row.currentRaw
                  const shareValue = isPrevious ? row.previousShare : row.currentShare
                  const legendLabel = isPrevious ? previousLabel : currentLabel

                  return (
                    <div className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-[11px] shadow-md">
                      <p className="mb-1 font-semibold text-foreground">{row.metric}</p>
                      <p className="inline-flex items-center gap-2 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(color) }} />
                        {legendLabel}
                      </p>
                      <p className="font-semibold text-foreground tabular">
                        {formatComparisonValue(rawValue, row.valueType)}
                      </p>
                      <p className="text-muted-foreground tabular">{formatPercent(shareValue)}</p>
                    </div>
                  )
                }}
                layers={['grid', 'axes', 'bars', shareLabelLayer, valueLabelLayer, monthLabelLayer, 'markers', 'legends']}
              />
            </div>
          </div>
        </ChartContainer>
      </PageSection>
    </div>
  )
}
