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

const PREVIOUS_COLOR = '#5f5f5f'
const CURRENT_COLOR = '#d5ea43'

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
  return `${formatNumber(Math.round(value / 1000))} K`
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

function buildChartRows(metrics: ComparisonMetric[]): ComparisonBarDatum[] {
  return metrics.map((metric) => {
    const pairMax = Math.max(metric.previousValue, metric.currentValue, 1)
    const pairTotal = Math.max(metric.previousValue + metric.currentValue, 1)

    return {
      metric: metric.label,
      valueType: metric.valueType,
      previous: (metric.previousValue / pairMax) * 100,
      current: (metric.currentValue / pairMax) * 100,
      previousRaw: metric.previousValue,
      currentRaw: metric.currentValue,
      previousShare: (metric.previousValue / pairTotal) * 100,
      currentShare: (metric.currentValue / pairTotal) * 100,
    }
  })
}

function createValueLabelLayer(): (props: BarCustomLayerProps<ComparisonBarDatum>) => ReactElement {
  return ({ bars }) => (
    <g>
      {bars.map((bar) => {
        const datum = bar.data.data as ComparisonBarDatum
        const isPrevious = bar.key === 'previous'
        const rawValue = isPrevious ? datum.previousRaw : datum.currentRaw
        const label = formatComparisonValue(rawValue, datum.valueType)

        return (
          <text
            key={`value-${bar.key}-${String(bar.data.indexValue)}`}
            x={bar.x + bar.width / 2}
            y={bar.y - 8}
            textAnchor="middle"
            fontSize={18}
            fontWeight={700}
            fill="#111827"
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
        const isPrevious = bar.key === 'previous'
        const shareValue = isPrevious ? datum.previousShare : datum.currentShare

        return (
          <text
            key={`share-${bar.key}-${String(bar.data.indexValue)}`}
            x={bar.x + bar.width / 2}
            y={bar.y + bar.height * 0.55}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill={isPrevious ? '#f8fafc' : '#111827'}
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
        const isPrevious = bar.key === 'previous'
        const text = isPrevious ? previousLabel : currentLabel

        return (
          <text
            key={`month-${bar.key}-${String(bar.data.indexValue)}`}
            x={bar.x + bar.width / 2}
            y={innerHeight + 18}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={isPrevious ? PREVIOUS_COLOR : '#7a8f1d'}
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
        id: 'gpv',
        label: 'GPV',
        valueType: 'k',
        previousValue: Math.max(0, previousMonthly?.ikasGPV ?? 0),
        currentValue: Math.max(0, currentMonthly?.ikasGPV ?? 0),
      },
      {
        id: 'shikas',
        label: 'Shikas',
        valueType: 'k',
        previousValue: Math.max(0, previousMonthly?.spGPV ?? 0),
        currentValue: Math.max(0, currentMonthly?.spGPV ?? 0),
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

  const chartData = useMemo(() => buildChartRows(metrics), [metrics])
  const shareLabelLayer = useMemo(() => createShareLabelLayer(), [])
  const valueLabelLayer = useMemo(() => createValueLabelLayer(), [])
  const monthLabelLayer = useMemo(
    () => createBarMonthLabelLayer(previousLabel, currentLabel),
    [currentLabel, previousLabel],
  )

  return (
    <div className="space-y-6">
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
              <div className="absolute top-4 bottom-12 left-2 w-px bg-[#707070]" />
              <div className="absolute right-0 bottom-12 left-2 h-px bg-[#707070]" />
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
                    <div className="rounded-lg border border-border/80 bg-white px-3 py-2 text-xs shadow-md">
                      <p className="mb-1 font-semibold text-foreground">{row.metric}</p>
                      <p className="inline-flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: String(color) }} />
                        {legendLabel}
                      </p>
                      <p className="font-semibold text-foreground">
                        {formatComparisonValue(rawValue, row.valueType)}
                      </p>
                      <p className="text-muted-foreground">{formatPercent(shareValue)}</p>
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
