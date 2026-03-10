import { useEffect, useMemo } from 'react'
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

  return (
    <div className="space-y-6">
      <PageSection
        title="Gerçekleşen Hedef"
        description={`${getMonthName(previousPeriod.month)} ${previousPeriod.year} hedeflerinden canlıya alınan markalar`}
      >
        <TargetBrandsList data={realizedTargets} showStatus={false} />
      </PageSection>
    </div>
  )
}
