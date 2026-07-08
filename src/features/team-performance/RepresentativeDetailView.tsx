import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar, type BarDatum } from '@nivo/bar'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { dashboardChartTheme } from '@/components/charts/chart-theme'
import { getRepresentativePhoto } from '@/constants/representative-photos'
import { formatNumber } from '@/utils/format'
import { buildRollingPeriodWindow, useDashboardDataStore } from '@/stores/dashboard-data-store'
import {
  calculateRepresentativeMetrics,
  getDefaultRepresentativeWeights,
  isRepresentativeCsatPeriod,
} from './representative-success-utils'
import { cn } from '@/lib/utils'
import type { RepresentativeSuccessRecord } from '@/types/team'

// Manual data collection only exists from 2026 onward (matches RepresentativeMonthlyNpsChart's cutoff).
const HISTORY_START_YEAR = 2026
const HISTORY_START_MONTH = 1

type DetailScope = 'all' | 'year' | 'quarter'

const SCOPE_OPTIONS: { id: DetailScope; label: string }[] = [
  { id: 'all', label: 'Tüm Zamanlar' },
  { id: 'year', label: 'Yıllık' },
  { id: 'quarter', label: 'Çeyreklik' },
]

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

interface RepresentativeDetailViewProps {
  name: string
  year: number
  month: number
  onBack: () => void
}

interface RepMonthPoint {
  label: string
  year: number
  month: number
  record: RepresentativeSuccessRecord
  successIndex: number
  usesCsat: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function RepresentativeDetailView({ name, year, month, onBack }: RepresentativeDetailViewProps) {
  const periods = useDashboardDataStore((s) => s.periods)
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const fullWindow = useMemo(() => {
    const size = Math.max(1, (year - HISTORY_START_YEAR) * 12 + (month - HISTORY_START_MONTH) + 1)
    return buildRollingPeriodWindow(year, month, size)
  }, [year, month])

  useEffect(() => {
    fullWindow.forEach((item) => {
      void ensurePeriod(item.year, item.month)
    })
  }, [ensurePeriod, fullWindow])

  const allPoints = useMemo<RepMonthPoint[]>(() => {
    return fullWindow
      .map((item) => {
        const reps = periods[item.key]?.representativeSuccess ?? []
        const record = reps.find((r) => r.name.trim() === name.trim())
        if (!record) return null
        const usesCsat = isRepresentativeCsatPeriod(item.year, item.month)
        const weights = getDefaultRepresentativeWeights(item.year, item.month)
        const successIndex = calculateRepresentativeMetrics(record, weights, item.year, item.month).successIndex
        return { label: item.label, year: item.year, month: item.month, record, successIndex, usesCsat }
      })
      .filter((p): p is RepMonthPoint => p !== null)
  }, [fullWindow, periods, name])

  const yearOptions = useMemo(
    () => Array.from(new Set(allPoints.map((p) => p.year))).sort((a, b) => a - b),
    [allPoints],
  )

  const [scope, setScope] = useState<DetailScope>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil(month / 3))
  const [yearOverride, setYearOverride] = useState<number | null>(null)
  const selectedYear = yearOverride !== null && yearOptions.includes(yearOverride)
    ? yearOverride
    : (yearOptions[yearOptions.length - 1] ?? year)

  const points = useMemo(() => {
    if (scope === 'all') return allPoints
    if (scope === 'year') return allPoints.filter((p) => p.year === selectedYear)
    const startMonth = (selectedQuarter - 1) * 3 + 1
    const endMonth = startMonth + 2
    return allPoints.filter((p) => p.year === selectedYear && p.month >= startMonth && p.month <= endMonth)
  }, [allPoints, scope, selectedYear, selectedQuarter])

  const scopeLabel = useMemo(() => {
    if (scope === 'all') return 'tüm zamanlar'
    if (scope === 'year') return `${selectedYear}`
    return `${QUARTERS[selectedQuarter - 1]} ${selectedYear}`
  }, [scope, selectedYear, selectedQuarter])

  const latest = points[points.length - 1] ?? null
  const photo = latest?.record.imageUrl || getRepresentativePhoto(name)

  const successIndexSeries = useMemo(
    () => [{ id: 'Başarı Endeksi', data: points.map((p) => ({ x: p.label, y: Number(p.successIndex.toFixed(1)) })) }],
    [points],
  )

  const liveVsTargetData = useMemo<BarDatum[]>(
    () =>
      points.map((p) => ({
        ay: p.label,
        'Canlıya Alınan': p.record.liveCount,
        Hedef: p.record.liveTarget,
      })),
    [points],
  )

  const auditSeries = useMemo(
    () => [{ id: 'Audit', data: points.map((p) => ({ x: p.label, y: Number(p.record.auditScore.toFixed(1)) })) }],
    [points],
  )

  const surveySeries = useMemo(() => {
    const anket = {
      id: 'Anket Skoru (NPS/CSAT)',
      data: points.map((p) => ({
        x: p.label,
        y: Number((p.usesCsat ? p.record.csatScore : p.record.npsScore).toFixed(2)),
      })),
    }
    const meetingPoints = points.filter((p) => !p.usesCsat)
    const series = [anket]
    if (meetingPoints.length > 0) {
      series.push({
        id: 'Toplantı',
        data: meetingPoints.map((p) => ({ x: p.label, y: Number(p.record.meetingScore.toFixed(2)) })),
      })
    }
    return series
  }, [points])

  const durationPoints = useMemo(() => points.filter((p) => p.record.avgGoLiveDurationDays > 0), [points])
  const durationSeries = useMemo(
    () => [
      {
        id: 'Ort. Süre',
        data: durationPoints.map((p) => ({ x: p.label, y: Number(p.record.avgGoLiveDurationDays.toFixed(1)) })),
      },
    ],
    [durationPoints],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="rounded-full" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Leaderboard'a dön
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-1">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={cn(
                  'rounded-full px-3 py-1 text-[12px] font-medium transition-colors',
                  scope === opt.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setScope(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {scope !== 'all' && yearOptions.length > 0 && (
            <SearchableSelect
              value={selectedYear}
              onChange={(v) => setYearOverride(Number(v))}
              options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
              triggerClassName="h-8 text-[12px]"
            />
          )}

          {scope === 'quarter' && (
            <SearchableSelect
              value={selectedQuarter}
              onChange={(v) => setSelectedQuarter(Number(v))}
              options={QUARTERS.map((q, i) => ({ value: i + 1, label: q }))}
              triggerClassName="h-8 text-[12px]"
              popoverClassName="min-w-[100px]"
            />
          )}
        </div>
      </div>

      <div className="bento-card relative overflow-hidden p-6">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(165deg, var(--color-accent) 0%, var(--color-accent-soft) 50%, var(--color-surface-warm) 100%)',
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="h-20 w-20 rounded-2xl border-4 border-white/70 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/70 bg-foreground text-[26px] font-semibold text-background shadow-md">
                {getInitials(name)}
              </div>
            )}
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight text-foreground">{name}</h2>
              <p className="mt-1 text-[12.5px] text-foreground/60">
                {points.length} aylık veri · {scopeLabel}
              </p>
            </div>
          </div>

          {latest && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Başarı Endeksi', value: latest.successIndex.toFixed(1) },
                { label: 'Canlıya Alınan', value: formatNumber(latest.record.liveCount) },
                { label: 'Hedef', value: formatNumber(latest.record.liveTarget) },
                { label: 'Audit', value: `${latest.record.auditScore.toFixed(1)}/100` },
                {
                  label: latest.usesCsat ? 'CSAT' : 'NPS',
                  value: `${(latest.usesCsat ? latest.record.csatScore : latest.record.npsScore).toFixed(2)}/5`,
                },
                { label: 'Ort. Gün', value: latest.record.avgGoLiveDurationDays.toFixed(1) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-foreground/8 px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-foreground/60">{s.label}</p>
                  <p className="mt-0.5 font-mono tabular text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {points.length === 0 ? (
        <div className="bento-card py-12 text-center text-[12px] text-muted-foreground">
          Bu temsilci için veri bulunamadı.
        </div>
      ) : (
        <>
          <ChartContainer title="Başarı Endeksi Trendi" subtitle={`${name} — aylık başarı endeksi`} height={280}>
            <ResponsiveLine
              data={successIndexSeries}
              margin={{ top: 34, right: 24, bottom: 40, left: 50 }}
              curve="monotoneX"
              enablePoints
              pointSize={7}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enablePointLabel
              pointLabel={(point) => String(point.data.y)}
              pointLabelYOffset={-14}
              useMesh
              colors={['#496275']}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              axisBottom={{ tickSize: 0, tickPadding: 10 }}
              axisLeft={{ tickSize: 0, tickPadding: 10, legend: 'Endeks', legendOffset: -40, legendPosition: 'middle' }}
              theme={dashboardChartTheme}
              enableArea
              areaOpacity={0.12}
              animate
              motionConfig="gentle"
            />
          </ChartContainer>

          <ChartContainer title="Canlıya Alınan vs Hedef" subtitle={`${name} — aylık gerçekleşme`} height={300}>
            <ResponsiveBar
              data={liveVsTargetData}
              keys={['Canlıya Alınan', 'Hedef']}
              indexBy="ay"
              groupMode="grouped"
              margin={{ top: 24, right: 24, bottom: 40, left: 50 }}
              padding={0.3}
              colors={['#78b889', '#c8ccd0']}
              borderRadius={4}
              axisBottom={{ tickSize: 0, tickPadding: 10 }}
              axisLeft={{ tickSize: 0, tickPadding: 10 }}
              theme={dashboardChartTheme}
              enableLabel
              label={(d) => formatNumber(Number(d.value ?? 0))}
              labelPosition="end"
              labelOffset={-16}
              labelTextColor={{ from: 'color', modifiers: [['darker', 2.4]] }}
              animate
              motionConfig="gentle"
            />
          </ChartContainer>

          <div className="bento-card overflow-hidden">
            <div className="px-6 pt-5 pb-1">
              <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                Kalite Skorları
              </span>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Audit (0–100) ve Anket / Toplantı (0–5) trendleri ayrı ölçeklerde gösterilir
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 px-2 pb-4 lg:grid-cols-2">
              <div style={{ height: 260 }}>
                <ResponsiveLine
                  data={auditSeries}
                  margin={{ top: 34, right: 24, bottom: 40, left: 50 }}
                  curve="monotoneX"
                  enablePoints
                  pointSize={6}
                  enablePointLabel
                  pointLabel={(point) => String(point.data.y)}
                  pointLabelYOffset={-14}
                  useMesh
                  colors={['#7d9ec2']}
                  yScale={{ type: 'linear', min: 0, max: 100 }}
                  axisBottom={{ tickSize: 0, tickPadding: 10 }}
                  axisLeft={{ tickSize: 0, tickPadding: 10, legend: 'Audit', legendOffset: -40, legendPosition: 'middle' }}
                  theme={dashboardChartTheme}
                  animate
                  motionConfig="gentle"
                />
              </div>
              <div style={{ height: 260 }}>
                <div className="mb-1 flex items-center gap-3 pl-1 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#e78bb7' }} />
                    Anket Skoru (NPS/CSAT)
                  </span>
                  {surveySeries.length > 1 && (
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#f2c078' }} />
                      Toplantı
                    </span>
                  )}
                </div>
                <ResponsiveLine
                  data={surveySeries}
                  margin={{ top: 26, right: 24, bottom: 40, left: 50 }}
                  curve="monotoneX"
                  enablePoints
                  pointSize={6}
                  enablePointLabel
                  pointLabel={(point) => String(point.data.y)}
                  pointLabelYOffset={-14}
                  useMesh
                  colors={['#e78bb7', '#f2c078']}
                  yScale={{ type: 'linear', min: 0, max: 5 }}
                  axisBottom={{ tickSize: 0, tickPadding: 10 }}
                  axisLeft={{ tickSize: 0, tickPadding: 10, legend: 'Anket / Toplantı', legendOffset: -40, legendPosition: 'middle' }}
                  theme={dashboardChartTheme}
                  animate
                  motionConfig="gentle"
                />
              </div>
            </div>
          </div>

          <ChartContainer
            title="Ortalama Canlıya Alma Süresi"
            subtitle={`${name} — aylık ortalama süre (gün)`}
            height={280}
            isEmpty={durationPoints.length === 0}
          >
            <ResponsiveLine
              data={durationSeries}
              margin={{ top: 34, right: 24, bottom: 40, left: 50 }}
              curve="monotoneX"
              enablePoints
              pointSize={7}
              enablePointLabel
              pointLabel={(point) => `${point.data.y} g`}
              pointLabelYOffset={-14}
              useMesh
              colors={['#f39d82']}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              axisBottom={{ tickSize: 0, tickPadding: 10 }}
              axisLeft={{ tickSize: 0, tickPadding: 10, legend: 'Gün', legendOffset: -40, legendPosition: 'middle' }}
              theme={dashboardChartTheme}
              animate
              motionConfig="gentle"
            />
          </ChartContainer>
        </>
      )}
    </div>
  )
}
