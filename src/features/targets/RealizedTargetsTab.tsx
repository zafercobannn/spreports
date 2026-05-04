import { useEffect, useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import { getMonthName } from '@/utils/date-utils'
import { TargetBrandsList } from './TargetBrandsList'

function TargetCountSummary({
  realized,
  target,
  periodLabel,
}: {
  realized: number
  target: number
  periodLabel: string
}) {
  const percentage = target > 0 ? Math.min(100, Math.round((realized / target) * 100)) : 0
  const isComplete = target > 0 && realized >= target

  return (
    <div className="lin-section p-[18px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-md border border-border ${isComplete ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]'}`}>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">{periodLabel}</p>
            <p className="font-mono text-[22px] font-semibold tracking-[-0.02em] text-foreground tabular">
              {realized}
              {target > 0 && (
                <span className="text-[16px] text-muted-foreground"> / {target}</span>
              )}
              <span className="ml-2 font-sans text-[13px] font-normal text-muted-foreground">canlıya alındı</span>
            </p>
          </div>
        </div>
        {target > 0 && (
          <span className={`lin-chip ${isComplete ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]'}`}>
            %{percentage}
          </span>
        )}
      </div>
      {target > 0 && (
        <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-track">
          <div
            className={`bar-grow h-full ${isComplete ? 'bg-[var(--color-success)]' : 'bg-[var(--color-chart)]'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function RealizedTargetsTab() {
  const { year, month } = useFilters()
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const periodKey = useMemo(() => getPeriodKey(year, month), [year, month])
  const periodData = useDashboardDataStore((s) => s.periods[periodKey])

  useEffect(() => {
    ensurePeriod(year, month)
  }, [ensurePeriod, month, year])

  const realizedTargets = useMemo(
    () => (periodData?.targets ?? []).filter((target) => target.status === 'live'),
    [periodData?.targets],
  )

  const targetCount = periodData?.targetCount ?? 0
  const realizedCount = periodData?.realizedCount ?? realizedTargets.length
  const periodLabel = `${getMonthName(month)} ${year}`

  return (
    <div className="space-y-6">
      <TargetCountSummary
        realized={realizedCount}
        target={targetCount}
        periodLabel={periodLabel}
      />
      <PageSection
        title="Gerçekleşen Hedef"
        description={`${periodLabel} hedeflerinden canlıya alınan markalar`}
      >
        <TargetBrandsList data={realizedTargets} showStatus={false} />
      </PageSection>
    </div>
  )
}
