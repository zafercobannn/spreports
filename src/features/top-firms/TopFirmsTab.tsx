import { Crown } from 'lucide-react'
import { TopFirmsTable } from './TopFirmsTable'
import { ShippingUsageChart } from './ShippingUsageChart'
import { ParsUsageChart } from './ParsUsageChart'
import { PwiUsageChart } from './PwiUsageChart'
import { PageSection } from '@/components/layout/PageSection'
import { formatCompactCurrency, formatNumber } from '@/utils/format'
import { sum, ratio } from '@/utils/calculations'
import { useDashboardPeriodData } from '@/hooks/use-dashboard-data'

export function TopFirmsTab() {
  const periodData = useDashboardPeriodData()
  if (!periodData) return null
  const data = periodData.topFirms

  const totalRevenue = sum(data.map((f) => f.gpv))
  const ikasUsers = data.filter((f) => f.ikasCargoValue > 0).length
  const ikasNonUsers = Math.max(0, data.length - ikasUsers)
  const ikasUsageRate = ratio(ikasUsers, Math.max(1, data.length))
  const parsUsers = data.filter((f) => f.usesPars).length
  const parsNonUsers = Math.max(0, data.length - parsUsers)
  const parsUsageRate = ratio(parsUsers, Math.max(1, data.length))
  const pwiUsers = data.filter((f) => f.usesPwi).length
  const pwiNonUsers = Math.max(0, data.length - pwiUsers)
  const pwiUsageRate = ratio(pwiUsers, Math.max(1, data.length))

  return (
    <div className="space-y-6">
      {/* Featured KPI grid — 1 hero + 3 ratio cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="bento-card relative overflow-hidden p-5 lg:col-span-1">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(150deg, var(--color-accent) 0%, var(--color-accent-soft) 60%, var(--color-surface-warm) 100%)',
            }}
          />
          <div className="relative flex h-full flex-col justify-between gap-4">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                Toplam Ciro
              </span>
              <Crown className="h-4 w-4 text-foreground/70" />
            </div>
            <p className="font-mono tabular text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
              {formatCompactCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-foreground/60">Top {data.length} firmanın aylık GPV toplamı</p>
          </div>
        </div>

        <UsageMiniCard
          label="ikas Kargo Kullanan"
          ratePct={ikasUsageRate}
          users={ikasUsers}
          nonUsers={ikasNonUsers}
          total={data.length}
        />
        <UsageMiniCard
          label="PARS Kullanan"
          ratePct={parsUsageRate}
          users={parsUsers}
          nonUsers={parsNonUsers}
          total={data.length}
        />
        <UsageMiniCard
          label="PWI Kullanan"
          ratePct={pwiUsageRate}
          users={pwiUsers}
          nonUsers={pwiNonUsers}
          total={data.length}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

function UsageMiniCard({
  label,
  ratePct,
  users,
  nonUsers,
  total,
}: {
  label: string
  ratePct: number
  users: number
  nonUsers: number
  total: number
}) {
  return (
    <div className="bento-card flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
          {label}
        </span>
        <span className="font-mono tabular text-[11px] text-muted-foreground">
          {users}/{total}
        </span>
      </div>

      <p className="font-mono tabular text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
        %{Math.round(ratePct)}
      </p>

      <div className="space-y-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-track">
          <div
            className="bar-grow h-full bg-[var(--color-accent)]"
            style={{ width: `${Math.min(100, ratePct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-subtle">
          <span>{formatNumber(users)} kullanan</span>
          <span>{formatNumber(nonUsers)} kullanmayan</span>
        </div>
      </div>
    </div>
  )
}
