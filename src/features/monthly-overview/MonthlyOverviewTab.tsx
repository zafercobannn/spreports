import { useMemo } from 'react'
import { Layers, Sparkles } from 'lucide-react'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import {
  formatCompactCurrency,
  formatNumber,
  formatPercent,
} from '@/utils/format'
import { ratio, percentChange } from '@/utils/calculations'
import type { MonthlyGPV } from '@/types/gpv'
import type { TargetBrand } from '@/types/targets'
import type { TopFirm } from '@/types/firms'
import { GPVMetricsPanel } from './GPVMetricsPanel'
import { LiveDistributionChart } from './LiveDistributionChart'
import { PreviousPlatformChart } from './PreviousPlatformChart'
import { PageSection } from '@/components/layout/PageSection'

const MONTH_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

export function MonthlyOverviewTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.monthlyGPV

  return (
    <div className="space-y-6">
      {/* Bento — 4×2 grid, no empty cells */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="fade-up fade-up-d1">
          <IkasGPVHeroCard data={data} />
        </div>
        <div className="fade-up fade-up-d2">
          <ProgressBarCard />
        </div>
        <div className="fade-up fade-up-d3">
          <GPVDonutCard data={data} />
        </div>
        <div className="fade-up fade-up-d4">
          <OnboardingPillsCard data={data} periodData={periodData} />
        </div>

        <div className="fade-up fade-up-d5">
          <TopPlatformsCard data={data} />
        </div>
        <div className="fade-up fade-up-d6 lg:col-span-2">
          <TopFirmsRailCard topFirms={periodData.topFirms} />
        </div>
        <div className="fade-up fade-up-d7">
          <PendingTargetsInkCard targets={periodData.targets} />
        </div>
      </div>

      {/* Detailed KPI grid */}
      <PageSection title="GPV Metrikleri" description="İlgili ay genel bakış">
        <GPVMetricsPanel data={data} />
      </PageSection>

      {/* Distribution + previous platforms */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LiveDistributionChart data={data} />
        <PreviousPlatformChart
          title="SP Önceki Platform Dağılımı"
          data={data.previousPlatformsSP}
        />
      </div>

      <PreviousPlatformChart
        title="Premium Onboarding Önceki Platform Dağılımı"
        data={data.previousPlatformsPremiumOnboarding}
      />
    </div>
  )
}

/* ─────────────────── ikas GPV hero ─────────────────── */
function IkasGPVHeroCard({ data }: { data: MonthlyGPV }) {
  const { year, month } = useFilters()
  const periods = useDashboardDataStore((s) => s.periods)

  const change = useMemo(() => {
    const allKeys = Object.keys(periods).sort()
    const idx = allKeys.indexOf(getPeriodKey(year, month))
    if (idx === -1) return 0
    const prev = allKeys[idx - 1] ? periods[allKeys[idx - 1]]?.monthlyGPV?.ikasGPV ?? 0 : 0
    return prev > 0 ? percentChange(data.ikasGPV, prev) : 0
  }, [periods, year, month, data.ikasGPV])

  const isUp = change >= 0

  return (
    <div className="bento-card relative h-full min-h-[280px] overflow-hidden p-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(150deg, var(--color-accent) 0%, var(--color-accent-soft) 45%, var(--color-surface-warm) 100%)',
        }}
      />
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-foreground/8 blur-3xl" />

      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-foreground/70">
              ikas GPV
            </span>
          </div>
          <span
            className={
              'rounded-full px-3 py-1 font-mono tabular text-[11px] font-semibold ' +
              (isUp ? 'bg-foreground text-background' : 'bg-[var(--color-danger)] text-white')
            }
          >
            {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        </div>

        <p className="mt-3 font-mono tabular text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[48px]">
          {formatCompactCurrency(data.ikasGPV)}
        </p>

        <div className="mt-auto flex items-center justify-end gap-2 pt-4">
          <span className="rounded-full border border-foreground/20 px-3 py-1 text-[11px] font-medium text-foreground">
            <Sparkles className="mr-1.5 inline-block h-3 w-3 align-[-2px]" />
            SP payı {formatPercent(data.gpvRatio)}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Progress bar chart (last 6 months SP GPV) ─────────────────── */
function ProgressBarCard() {
  const { year, month } = useFilters()
  const periods = useDashboardDataStore((s) => s.periods)

  const data = useMemo(() => {
    const allKeys = Object.keys(periods).sort()
    const idx = allKeys.indexOf(getPeriodKey(year, month))
    if (idx === -1) return []
    const start = Math.max(0, idx - 5)
    return allKeys.slice(start, idx + 1).map((k) => {
      const m = Number(k.split('-')[1] ?? 0) - 1
      const g = periods[k]?.monthlyGPV
      return {
        label: MONTH_SHORT[m] ?? '?',
        value: g?.spGPV ?? 0,
        key: k,
      }
    })
  }, [periods, year, month])

  const max = Math.max(...data.map((d) => d.value), 1)
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const lastValue = last?.value ?? 0
  const change = prev && prev.value > 0 ? percentChange(lastValue, prev.value) : 0
  const isUp = change >= 0

  return (
    <div className="bento-card bento-card-warm h-full min-h-[280px] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
            Aylık SP GPV
          </span>
        </div>
        {prev && (
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

      <p className="mt-3 font-mono tabular text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[48px]">
        {formatCompactCurrency(lastValue)}
      </p>

      <div className="mt-5 flex h-24 items-end justify-between gap-3">
        {data.map((d, i) => {
          const isLast = i === data.length - 1
          const heightPct = (d.value / max) * 100
          return (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end justify-center">
                <div
                  className={
                    'bar-grow-y w-2.5 rounded-t-full ' +
                    (isLast ? 'bg-[var(--color-accent)]' : 'bg-foreground')
                  }
                  style={{ height: `${Math.max(8, heightPct)}%`, animationDelay: `${i * 80}ms` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────── GPV donut tracker ─────────────────── */
function GPVDonutCard({ data }: { data: MonthlyGPV }) {
  const ratioPct = data.ikasGPV > 0 ? (data.spGPV / data.ikasGPV) * 100 : 0
  const size = 150
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, ratioPct / 100))

  return (
    <div className="bento-card h-full min-h-[280px] p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          GPV Dağılımı
        </p>
        <p className="mt-1 text-[11px] text-subtle">SP / toplam ikas oranı</p>
      </div>

      <div className="mt-3 flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--color-track)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.22,1,.36,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono tabular text-[26px] font-semibold tracking-tight text-foreground">
              {formatPercent(ratioPct)}
            </span>
            <span className="text-[10px] text-muted-foreground">SP payı</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-border bg-surface-muted/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">SP GPV</p>
          <p className="mt-0.5 font-mono tabular text-[13px] font-semibold text-foreground">
            {formatCompactCurrency(data.spGPV)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface-muted/40 px-3 py-2">
          <p className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground">ikas GPV</p>
          <p className="mt-0.5 font-mono tabular text-[13px] font-semibold text-foreground">
            {formatCompactCurrency(data.ikasGPV)}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Onboarding pills ─────────────────── */
function OnboardingPillsCard({
  data,
  periodData,
}: {
  data: MonthlyGPV
  periodData: { targets: TargetBrand[]; targetCount: number; realizedCount: number | null }
}) {
  const realizedRate = ratio(
    periodData.realizedCount ?? periodData.targets.filter((t) => t.status === 'live').length,
    Math.max(1, periodData.targetCount),
  )
  const liveSpRate = ratio(data.liveSPCount, Math.max(1, data.totalSP))
  const premiumRate = ratio(
    data.premiumOnboardingLiveCount,
    Math.max(1, data.monthlyLiveCount),
  )

  return (
    <div className="bento-card h-full min-h-[280px] p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Onboarding Sağlığı
        </p>
        <p className="mt-1 text-[11px] text-subtle">3 metriğin ağırlıklı ortalaması</p>
      </div>

      <div className="mt-5 space-y-3">
        <RatioRow
          label="Hedef Gerçekleşme"
          pct={realizedRate}
          variant="yellow"
          right={`${periodData.realizedCount ?? periodData.targets.filter((t) => t.status === 'live').length}/${periodData.targetCount}`}
        />
        <RatioRow
          label="Canlı SP / Toplam SP"
          pct={liveSpRate}
          variant="ink"
          right={`${formatNumber(data.liveSPCount)}/${formatNumber(data.totalSP)}`}
        />
        <RatioRow
          label="Premium / Aylık Live"
          pct={premiumRate}
          variant="muted"
          right={`${formatNumber(data.premiumOnboardingLiveCount)}/${formatNumber(data.monthlyLiveCount)}`}
        />
      </div>
    </div>
  )
}

function RatioRow({
  label,
  pct,
  variant,
  right,
}: {
  label: string
  pct: number
  variant: 'yellow' | 'ink' | 'muted'
  right: string
}) {
  const fillCls =
    variant === 'yellow'
      ? 'bg-[var(--color-accent)]'
      : variant === 'ink'
        ? 'bg-foreground'
        : 'bg-muted-foreground/40'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular text-foreground">
          {Math.round(pct)}%
          <span className="ml-1.5 text-subtle">{right}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-track">
        <div
          className={`bar-grow h-full ${fillCls}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}

/* ─────────────────── Pending Targets ink card ─────────────────── */
function PendingTargetsInkCard({ targets }: { targets: TargetBrand[] }) {
  const pending = useMemo(
    () => targets.filter((t) => t.status !== 'live').slice(0, 5),
    [targets],
  )
  const total = targets.length
  const live = targets.filter((t) => t.status === 'live').length

  return (
    <div className="bento-card bento-card-ink h-full min-h-[280px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink-foreground)]/60">
            Bekleyen Hedef
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--color-ink-foreground)]/45">Canlıya alınacak markalar</p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-mono tabular text-[var(--color-ink-foreground)]">
          {live}/{total}
        </span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {pending.length === 0 && (
          <li className="rounded-md border border-white/10 px-3 py-3 text-center text-[12px] text-[var(--color-ink-foreground)]/55">
            Tüm hedefler tamamlandı
          </li>
        )}
        {pending.map((t) => {
          const initials = t.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
          return (
            <li key={t.name} className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-[10px] font-semibold text-[var(--color-ink-foreground)]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-[var(--color-ink-foreground)]">{t.name}</p>
                <p className="text-[10px] text-[var(--color-ink-foreground)]/50">
                  {t.sector || 'Bekliyor'}
                </p>
              </div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15">
                <span className="h-2 w-2 rounded-full bg-white/30" />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ─────────────────── Top platforms (ex Devices) ─────────────────── */
function TopPlatformsCard({ data }: { data: MonthlyGPV }) {
  const top3 = useMemo(
    () =>
      [...data.previousPlatformsSP]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    [data.previousPlatformsSP],
  )
  const total = data.previousPlatformsSP.reduce((s, p) => s + p.count, 0)

  return (
    <div className="bento-card h-full min-h-[280px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Önceki Platformlar
          </p>
          <p className="mt-0.5 text-[11px] text-subtle">SP'ye geçenlerin kaynağı · top 3</p>
        </div>
        <Layers className="h-4 w-4 text-muted-foreground" />
      </div>

      <ul className="mt-5 space-y-4">
        {top3.length === 0 && (
          <li className="text-[12px] text-muted-foreground">Veri yok</li>
        )}
        {top3.map((p) => {
          const pct = total > 0 ? (p.count / total) * 100 : 0
          return (
            <li key={p.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="font-mono tabular text-muted-foreground">
                  {formatNumber(p.count)}
                  <span className="ml-1.5 text-subtle">{Math.round(pct)}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-track">
                <div
                  className="bar-grow h-full bg-foreground"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ─────────────────── Top Firms rail (replaces fake calendar) ─────────────────── */
function TopFirmsRailCard({ topFirms }: { topFirms: TopFirm[] }) {
  const top4 = useMemo(() => topFirms.slice(0, 4), [topFirms])
  const totalGPV = useMemo(() => topFirms.reduce((s, f) => s + f.gpv, 0), [topFirms])
  const top15Sum = useMemo(() => top4.reduce((s, f) => s + f.gpv, 0), [top4])

  return (
    <div className="bento-card bento-card-warm h-full min-h-[280px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Top Firma Rail
          </p>
          <p className="mt-0.5 text-[11px] text-subtle">
            Top 4 firma · toplam payı %{totalGPV > 0 ? ((top15Sum / totalGPV) * 100).toFixed(1) : '0'}
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-mono tabular text-muted-foreground">
          {topFirms.length} firma
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {top4.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground">
            Top firma verisi yok
          </div>
        )}
        {top4.map((firm, i) => {
          const isInk = i === 0
          const initials = firm.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('')
          const sharePct = totalGPV > 0 ? (firm.gpv / totalGPV) * 100 : 0
          return (
            <div
              key={firm.name}
              className={
                'flex items-center justify-between gap-4 rounded-2xl px-4 py-3 ' +
                (isInk
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-surface text-foreground')
              }
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ' +
                    (isInk ? 'bg-white/15 text-background' : 'border border-border bg-surface-muted text-foreground')
                  }
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold">
                    <span className={'mr-2 font-mono ' + (isInk ? 'opacity-50' : 'text-subtle')}>
                      #{String(firm.rank ?? i + 1).padStart(2, '0')}
                    </span>
                    {firm.name}
                  </p>
                  <p className={'text-[11px] ' + (isInk ? 'opacity-60' : 'text-muted-foreground')}>
                    GPV {formatCompactCurrency(firm.gpv)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden w-24 sm:block">
                  <div className={'h-1.5 overflow-hidden rounded-full ' + (isInk ? 'bg-white/15' : 'bg-track')}>
                    <div
                      className={'bar-grow h-full ' + (isInk ? 'bg-[var(--color-accent)]' : 'bg-foreground')}
                      style={{ width: `${Math.min(100, sharePct * 4)}%` }}
                    />
                  </div>
                </div>
                <span className={'font-mono tabular text-[12px] ' + (isInk ? 'opacity-80' : 'text-muted-foreground')}>
                  %{sharePct.toFixed(1)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
