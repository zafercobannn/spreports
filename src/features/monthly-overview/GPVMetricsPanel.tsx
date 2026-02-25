import { KPICard } from '@/components/data-display/KPICard'
import { KPICardGrid } from '@/components/data-display/KPICardGrid'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'
import { DollarSign, Users, TrendingUp, Clock } from 'lucide-react'
import type { MonthlyGPV } from '@/types/gpv'

interface GPVMetricsPanelProps {
  data: MonthlyGPV
}

export function GPVMetricsPanel({ data }: GPVMetricsPanelProps) {
  return (
    <KPICardGrid columns={4}>
      <KPICard
        label="GPV"
        value={formatCurrency(data.ikasGPV)}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <KPICard
        label="SP GPV"
        value={formatCurrency(data.spGPV)}
        icon={<TrendingUp className="h-5 w-5" />}
        subtitle={`GPV Oranı: ${formatPercent(data.gpvRatio)}`}
      />
      <KPICard
        label="Canlı Hesap Sayısı"
        value={formatNumber(data.liveAccountCount)}
        icon={<Users className="h-5 w-5" />}
      />
      <KPICard
        label="Toplam SP"
        value={formatNumber(data.totalSP)}
        icon={<Users className="h-5 w-5" />}
        subtitle={`Premium: ${data.premiumOnboardingLiveCount}`}
      />
      <KPICard
        label="Aylık Live Sayısı"
        value={formatNumber(data.monthlyLiveCount)}
        subtitle={`${data.premiumOnboardingLiveCount} Premium Onboarding`}
      />
      <KPICard
        label="Premium Onboarding"
        value={formatNumber(data.premiumOnboardingLiveCount)}
        subtitle={`${formatPercent((data.premiumOnboardingLiveCount / data.monthlyLiveCount) * 100)} toplamın`}
      />
      <KPICard
        label="Ort. Canlıya Alma Süresi"
        value={`${data.avgGoLiveDurationDays} gün`}
        icon={<Clock className="h-5 w-5" />}
      />
      <KPICard
        label="GPV Oranı"
        value={formatPercent(data.gpvRatio)}
        subtitle="Total GPV / SP GPV"
      />
    </KPICardGrid>
  )
}
