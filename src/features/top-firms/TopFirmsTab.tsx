import { TopFirmsTable } from './TopFirmsTable'
import { ShippingUsageChart } from './ShippingUsageChart'
import { ParsUsageChart } from './ParsUsageChart'
import { PwiUsageChart } from './PwiUsageChart'
import { KPICard } from '@/components/data-display/KPICard'
import { KPICardGrid } from '@/components/data-display/KPICardGrid'
import { PageSection } from '@/components/layout/PageSection'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'
import { sum, ratio } from '@/utils/calculations'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TopFirmsTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.topFirms

  const totalRevenue = sum(data.map((f) => f.gpv))
  const ikasUsers = data.filter((f) => f.ikasCargoValue > 0).length
  const ikasNonUsers = Math.max(0, data.length - ikasUsers)
  const ikasUsageRate = ratio(ikasUsers, data.length)
  const parsUsers = data.filter((f) => f.usesPars).length
  const parsNonUsers = Math.max(0, data.length - parsUsers)
  const parsUsageRate = ratio(parsUsers, data.length)
  const pwiUsers = data.filter((f) => f.usesPwi).length
  const pwiNonUsers = Math.max(0, data.length - pwiUsers)
  const pwiUsageRate = ratio(pwiUsers, data.length)

  return (
    <div className="space-y-6">
      <PageSection title="Top 15 Özet">
        <KPICardGrid columns={4}>
          <KPICard label="Toplam Ciro" value={formatCurrency(totalRevenue)} />
          <KPICard
            label="ikas Kargo Kullanan"
            value={formatPercent(ikasUsageRate)}
            subtitle={`Kullanan: ${formatNumber(ikasUsers)} firma | Kullanmayan: ${formatNumber(ikasNonUsers)} firma`}
          />
          <KPICard
            label="PARS Kullanan"
            value={formatPercent(parsUsageRate)}
            subtitle={`Kullanan: ${formatNumber(parsUsers)} firma | Kullanmayan: ${formatNumber(parsNonUsers)} firma`}
          />
          <KPICard
            label="PWI Kullanan"
            value={formatPercent(pwiUsageRate)}
            subtitle={`Kullanan: ${formatNumber(pwiUsers)} firma | Kullanmayan: ${formatNumber(pwiNonUsers)} firma`}
          />
        </KPICardGrid>
      </PageSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PageSection title="Top 15 Firmalar" description="GPV sıralaması">
            <TopFirmsTable data={data} />
          </PageSection>
        </div>
        <div className="space-y-4">
          <PwiUsageChart data={data} />
          <ParsUsageChart data={data} />
          <ShippingUsageChart data={data} />
        </div>
      </div>
    </div>
  )
}
