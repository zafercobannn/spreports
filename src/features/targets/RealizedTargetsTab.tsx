import { useEffect, useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import { getMonthName } from '@/utils/date-utils'
import { TargetBrandsList } from './TargetBrandsList'

function getOffsetPeriod(year: number, month: number, offset: number): { year: number; month: number } {
  let nextYear = year
  let nextMonth = month + offset

  while (nextMonth < 1) {
    nextMonth += 12
    nextYear -= 1
  }

  while (nextMonth > 12) {
    nextMonth -= 12
    nextYear += 1
  }

  return { year: nextYear, month: nextMonth }
}

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
    <div className="rounded-xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{periodLabel}</p>
            <p className="text-2xl font-bold tracking-tight">
              {realized}
              {target > 0 && (
                <span className="text-lg font-normal text-muted-foreground"> / {target}</span>
              )}
              <span className="ml-2 text-base font-normal text-muted-foreground">adet canlıya alındı</span>
            </p>
          </div>
        </div>
        {target > 0 && (
          <span className={`text-sm font-semibold ${isComplete ? 'text-emerald-600' : 'text-blue-600'}`}>
            %{percentage}
          </span>
        )}
      </div>
      {target > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
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

  const previousPeriod = useMemo(() => getOffsetPeriod(year, month, -1), [year, month])
  const previousKey = useMemo(
    () => getPeriodKey(previousPeriod.year, previousPeriod.month),
    [previousPeriod.month, previousPeriod.year],
  )
  const previousData = useDashboardDataStore((s) => s.periods[previousKey])

  useEffect(() => {
    ensurePeriod(previousPeriod.year, previousPeriod.month)
  }, [ensurePeriod, previousPeriod.month, previousPeriod.year])

  const realizedTargets = useMemo(
    () => (previousData?.targets ?? []).filter((target) => target.status === 'live'),
    [previousData?.targets],
  )

  const targetCount = previousData?.targetCount ?? 0
  const realizedCount = previousData?.realizedCount ?? realizedTargets.length
  const periodLabel = `${getMonthName(previousPeriod.month)} ${previousPeriod.year}`

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
