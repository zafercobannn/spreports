import { useMemo } from 'react'
import { TurkishLira, Users, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { KPICard } from '@/components/data-display/KPICard'
import { formatCompactCurrency, formatNumber, formatPercent } from '@/utils/format'
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
        spark={ikasGPVSpark}
      />
      <KPICard
        label="SP GPV"
        icon={<TrendingUp className="h-4 w-4" />}
        numericValue={data.spGPV}
        formatValue={formatCompactCurrency}
        value={formatCompactCurrency(data.spGPV)}
        subtitle={`GPV oranı ${formatPercent(data.gpvRatio)}`}
        spark={spGPVSpark}
      />
      <KPICard
        label="Canlı Hesap Sayısı (SP)"
        icon={<Users className="h-4 w-4" />}
        numericValue={data.liveAccountCount}
        formatValue={formatNumber}
        value={formatNumber(data.liveAccountCount)}
        spark={liveAcctSpark}
      />
      <KPICard
        label="Canlı SP"
        icon={<Users className="h-4 w-4" />}
        numericValue={data.liveSPCount}
        formatValue={formatNumber}
        value={formatNumber(data.liveSPCount)}
        subtitle="En az 1 kere ödeme almış SP"
        spark={liveSPSpark}
      />
      <KPICard
        label="Toplam SP"
        icon={<Users className="h-4 w-4" />}
        numericValue={data.totalSP}
        formatValue={formatNumber}
        value={formatNumber(data.totalSP)}
        spark={totalSPSpark}
      />
      <KPICard
        label="Aylık Live Sayısı"
        icon={<Sparkles className="h-4 w-4" />}
        numericValue={data.monthlyLiveCount}
        formatValue={formatNumber}
        value={formatNumber(data.monthlyLiveCount)}
        spark={monthlyLiveSpark}
      />
      <KPICard
        label="Premium Onboarding"
        icon={<Sparkles className="h-4 w-4" />}
        numericValue={data.premiumOnboardingLiveCount}
        formatValue={formatNumber}
        value={formatNumber(data.premiumOnboardingLiveCount)}
        spark={premiumLiveSpark}
      />
      <KPICard
        label="Premium Onb. Ort. Canlıya Alma Süresi"
        icon={<Clock className="h-4 w-4" />}
        numericValue={data.premiumOnboardingAvgGoLiveDurationDays}
        formatValue={(n) => n.toFixed(1)}
        value={String(data.premiumOnboardingAvgGoLiveDurationDays)}
        unit="gün"
        spark={premiumDaysSpark}
      />
      <KPICard
        label="Scale Plus Ort. Canlıya Alma Süresi"
        icon={<Clock className="h-4 w-4" />}
        numericValue={data.scalePlusAvgGoLiveDurationDays}
        formatValue={(n) => n.toFixed(1)}
        value={String(data.scalePlusAvgGoLiveDurationDays)}
        unit="gün"
        spark={scaleDaysSpark}
      />
    </div>
  )
}
