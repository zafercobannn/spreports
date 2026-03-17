import { KPICard } from '@/components/data-display/KPICard'
import { KPICardGrid } from '@/components/data-display/KPICardGrid'
import { formatCompactCurrency, formatNumber, formatPercent } from '@/utils/format'
import { TurkishLira, Users, TrendingUp, Clock } from 'lucide-react'
import type { MonthlyGPV } from '@/types/gpv'

interface GPVMetricsPanelProps {
  data: MonthlyGPV
}

export function GPVMetricsPanel({ data }: GPVMetricsPanelProps) {
  return (
    <KPICardGrid columns={4}>
      <KPICard
        label="GPV"
        value={formatCompactCurrency(data.ikasGPV)}
        icon={<TurkishLira className="h-5 w-5" />}
      />
      <KPICard
        label="SP GPV"
        value={formatCompactCurrency(data.spGPV)}
        icon={<TrendingUp className="h-5 w-5" />}
        subtitle={(
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-primary/80 uppercase">
              GPV Oranı
            </span>
            <span className="text-lg font-bold text-primary">{formatPercent(data.gpvRatio)}</span>
          </div>
        )}
      />
      <KPICard
        label="Canlı Hesap Sayısı (SP)"
        value={formatNumber(data.liveAccountCount)}
        icon={<Users className="h-5 w-5" />}
      />
      <KPICard
        label="Canlı SP"
        value={formatNumber(data.liveSPCount)}
        icon={<Users className="h-5 w-5" />}
        subtitle="En az 1 kere ödeme almış SP"
      />
      <KPICard
        label="Toplam SP"
        value={formatNumber(data.totalSP)}
        icon={<Users className="h-5 w-5" />}
      />
      <KPICard
        label="Aylık Live Sayısı"
        value={formatNumber(data.monthlyLiveCount)}
      />
      <KPICard
        label="Premium Onboarding"
        value={formatNumber(data.premiumOnboardingLiveCount)}
      />
      <KPICard
        label="Premium Onboarding Ort. Canlıya Alma Süresi"
        value={`${data.premiumOnboardingAvgGoLiveDurationDays} gün`}
        icon={<Clock className="h-5 w-5" />}
      />
      <KPICard
        label="Scale Plus Ort. Canlıya Alma Süresi"
        value={`${data.scalePlusAvgGoLiveDurationDays} gün`}
        icon={<Clock className="h-5 w-5" />}
      />
    </KPICardGrid>
  )
}
