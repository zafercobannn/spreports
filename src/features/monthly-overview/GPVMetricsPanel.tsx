import { useMemo } from 'react'
import { TurkishLira, Users, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { KPICard } from '@/components/data-display/KPICard'
import { formatCompactCurrency, formatNumber, formatPercent } from '@/utils/format'
import { getTrendDirection, percentChange } from '@/utils/calculations'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import type { MonthlyGPV } from '@/types/gpv'

interface GPVMetricsPanelProps {
  data: MonthlyGPV
}

function buildSparkline(
  periods: Record<string, { monthlyGPV?: MonthlyGPV } | undefined>,
  periodKey: string,
  extract: (g: MonthlyGPV) => number,
): number[] {
  const allKeys = Object.keys(periods).sort()
  const idx = allKeys.indexOf(periodKey)
  if (idx === -1) return []
  const startIdx = Math.max(0, idx - 11)
  const slice = allKeys.slice(startIdx, idx + 1)
  return slice
    .map((k) => {
      const g = periods[k]?.monthlyGPV
      return g ? extract(g) : null
    })
    .filter((v): v is number => v != null && Number.isFinite(v))
}

function useTrend(extract: (g: MonthlyGPV) => number, current: number) {
  const { year, month } = useFilters()
  const periods = useDashboardDataStore((s) => s.periods)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevKey = getPeriodKey(prevYear, prevMonth)
  const prevValue = periods[prevKey]?.monthlyGPV ? extract(periods[prevKey]!.monthlyGPV) : null
  if (prevValue == null || prevValue === 0) return undefined
  const change = percentChange(current, prevValue)
  return { value: change, direction: getTrendDirection(change), isPositiveGood: true }
}

function useSparkline(extract: (g: MonthlyGPV) => number) {
  const { year, month } = useFilters()
  const periods = useDashboardDataStore((s) => s.periods)
  const periodKey = getPeriodKey(year, month)
  return useMemo(
    () => buildSparkline(periods, periodKey, extract),
    [periods, periodKey, extract],
  )
}

export function GPVMetricsPanel({ data }: GPVMetricsPanelProps) {
  const ikasGPVTrend = useTrend((g) => g.ikasGPV, data.ikasGPV)
  const spGPVTrend = useTrend((g) => g.spGPV, data.spGPV)
  const liveAcctTrend = useTrend((g) => g.liveAccountCount, data.liveAccountCount)
  const liveSPTrend = useTrend((g) => g.liveSPCount, data.liveSPCount)
  const totalSPTrend = useTrend((g) => g.totalSP, data.totalSP)
  const monthlyLiveTrend = useTrend((g) => g.monthlyLiveCount, data.monthlyLiveCount)
  const premiumLiveTrend = useTrend((g) => g.premiumOnboardingLiveCount, data.premiumOnboardingLiveCount)
  const premiumDaysTrend = useTrend((g) => g.premiumOnboardingAvgGoLiveDurationDays, data.premiumOnboardingAvgGoLiveDurationDays)
  const scaleDaysTrend = useTrend((g) => g.scalePlusAvgGoLiveDurationDays, data.scalePlusAvgGoLiveDurationDays)

  const ikasGPVSpark = useSparkline((g) => g.ikasGPV)
  const spGPVSpark = useSparkline((g) => g.spGPV)
  const liveAcctSpark = useSparkline((g) => g.liveAccountCount)
  const liveSPSpark = useSparkline((g) => g.liveSPCount)
  const totalSPSpark = useSparkline((g) => g.totalSP)
  const monthlyLiveSpark = useSparkline((g) => g.monthlyLiveCount)
  const premiumLiveSpark = useSparkline((g) => g.premiumOnboardingLiveCount)
  const premiumDaysSpark = useSparkline((g) => g.premiumOnboardingAvgGoLiveDurationDays)
  const scaleDaysSpark = useSparkline((g) => g.scalePlusAvgGoLiveDurationDays)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <KPICard
        label="GPV"
        icon={<TurkishLira className="h-4 w-4" />}
        numericValue={data.ikasGPV}
        formatValue={formatCompactCurrency}
        value={formatCompactCurrency(data.ikasGPV)}
        trend={ikasGPVTrend}
        spark={ikasGPVSpark}
      />
      <KPICard
        label="SP GPV"
        icon={<TrendingUp className="h-4 w-4" />}
        numericValue={data.spGPV}
        formatValue={formatCompactCurrency}
        value={formatCompactCurrency(data.spGPV)}
        subtitle={`GPV oranı ${formatPercent(data.gpvRatio)}`}
        trend={spGPVTrend}
        spark={spGPVSpark}
      />
      <KPICard
        label="Canlı Hesap Sayısı (SP)"
        icon={<Users className="h-4 w-4" />}
        numericValue={data.liveAccountCount}
        formatValue={formatNumber}
        value={formatNumber(data.liveAccountCount)}
        trend={liveAcctTrend}
        spark={liveAcctSpark}
      />
      <KPICard
        label="Canlı SP"
        icon={<Users className="h-4 w-4" />}
        numericValue={data.liveSPCount}
        formatValue={formatNumber}
        value={formatNumber(data.liveSPCount)}
        subtitle="En az 1 kere ödeme almış SP"
        trend={liveSPTrend}
        spark={liveSPSpark}
      />
      <KPICard
        label="Toplam SP"
        icon={<Users className="h-4 w-4" />}
        numericValue={data.totalSP}
        formatValue={formatNumber}
        value={formatNumber(data.totalSP)}
        trend={totalSPTrend}
        spark={totalSPSpark}
      />
      <KPICard
        label="Aylık Live Sayısı"
        icon={<Sparkles className="h-4 w-4" />}
        numericValue={data.monthlyLiveCount}
        formatValue={formatNumber}
        value={formatNumber(data.monthlyLiveCount)}
        trend={monthlyLiveTrend}
        spark={monthlyLiveSpark}
      />
      <KPICard
        label="Premium Onboarding"
        icon={<Sparkles className="h-4 w-4" />}
        numericValue={data.premiumOnboardingLiveCount}
        formatValue={formatNumber}
        value={formatNumber(data.premiumOnboardingLiveCount)}
        trend={premiumLiveTrend}
        spark={premiumLiveSpark}
      />
      <KPICard
        label="Premium Onb. Ort. Canlıya Alma Süresi"
        icon={<Clock className="h-4 w-4" />}
        numericValue={data.premiumOnboardingAvgGoLiveDurationDays}
        formatValue={(n) => n.toFixed(1)}
        value={String(data.premiumOnboardingAvgGoLiveDurationDays)}
        unit="gün"
        trend={premiumDaysTrend ? { ...premiumDaysTrend, isPositiveGood: false } : undefined}
        spark={premiumDaysSpark}
      />
      <KPICard
        label="Scale Plus Ort. Canlıya Alma Süresi"
        icon={<Clock className="h-4 w-4" />}
        numericValue={data.scalePlusAvgGoLiveDurationDays}
        formatValue={(n) => n.toFixed(1)}
        value={String(data.scalePlusAvgGoLiveDurationDays)}
        unit="gün"
        trend={scaleDaysTrend ? { ...scaleDaysTrend, isPositiveGood: false } : undefined}
        spark={scaleDaysSpark}
      />
    </div>
  )
}
