import { TopFirmsTable } from './TopFirmsTable'
import { ShippingUsageChart } from './ShippingUsageChart'
import { KPICard } from '@/components/data-display/KPICard'
import { KPICardGrid } from '@/components/data-display/KPICardGrid'
import { PageSection } from '@/components/layout/PageSection'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'
import { sum, average, ratio } from '@/utils/calculations'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TopFirmsTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.topFirms

  const totalRevenue = sum(data.map((f) => f.gpv))
  const totalShipments = sum(data.map((f) => f.shipmentSent))
  const ikasCargoUsers = data.filter((f) => f.ikasCargoValue > 0).length
  const ikasCargoNonUsers = Math.max(0, data.length - ikasCargoUsers)
  const ikasCargoUsageRate = ratio(ikasCargoUsers, data.length)
  const avgParsUsage = average(data.map((f) => f.parsUsageRate))
  const avgParsNonUsage = Math.max(0, 100 - avgParsUsage)

  return (
    <div className="space-y-6">
      <PageSection title="Top 15 Özet">
        <KPICardGrid columns={4}>
          <KPICard label="Toplam Ciro" value={formatCurrency(totalRevenue)} />
          <KPICard label="Toplam Gönderi" value={formatNumber(totalShipments)} />
          <KPICard
            label="ikas Kargo Kullanan"
            value={formatPercent(ikasCargoUsageRate)}
            subtitle={`Kullanmayan: ${formatPercent(ratio(ikasCargoNonUsers, data.length))}`}
          />
          <KPICard
            label="PARS Kullanan"
            value={formatPercent(avgParsUsage)}
            subtitle={`Kullanmayan: ${formatPercent(avgParsNonUsage)}`}
          />
        </KPICardGrid>
      </PageSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PageSection title="Top 15 Firmalar" description="GPV sıralaması">
            <TopFirmsTable data={data} />
          </PageSection>
        </div>
        <div>
          <ShippingUsageChart data={data} />
        </div>
      </div>
    </div>
  )
}
