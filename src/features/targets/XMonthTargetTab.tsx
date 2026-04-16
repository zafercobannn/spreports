import { useEffect, useMemo } from 'react'
import { Target } from 'lucide-react'
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

function TargetCountCard({ targetCount, periodLabel }: { targetCount: number; periodLabel: string }) {
  return (
    <div className="rounded-xl border border-black/6 bg-white/60 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{periodLabel}</p>
          <p className="text-2xl font-bold tracking-tight">
            {targetCount > 0 ? targetCount : '—'}
            <span className="ml-2 text-base font-normal text-muted-foreground">adet hedef</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function XMonthTargetTab() {
  const { year, month } = useFilters()
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const currentPeriodKey = useMemo(() => getPeriodKey(year, month), [year, month])
  const currentPeriodData = useDashboardDataStore((s) => s.periods[currentPeriodKey])

  const targetPeriod = useMemo(() => getOffsetPeriod(year, month, 1), [year, month])
  const targetKey = useMemo(
    () => getPeriodKey(targetPeriod.year, targetPeriod.month),
    [targetPeriod.month, targetPeriod.year],
  )
  const targetPeriodData = useDashboardDataStore((s) => s.periods[targetKey])

  useEffect(() => {
    ensurePeriod(year, month)
    ensurePeriod(targetPeriod.year, targetPeriod.month)
  }, [ensurePeriod, year, month, targetPeriod.month, targetPeriod.year])

  const currentLiveNames = useMemo(() => {
    const names = new Set<string>()
    for (const t of currentPeriodData?.targets ?? []) {
      if (t.status === 'live' && t.name.trim()) names.add(t.name.trim().toLocaleLowerCase('tr-TR'))
    }
    return names
  }, [currentPeriodData?.targets])

  const allTargets = targetPeriodData?.targets ?? []
  const pendingTargets = allTargets.filter(
    (t) => t.status !== 'live' && !currentLiveNames.has(t.name.trim().toLocaleLowerCase('tr-TR')),
  )
  const targetCount = targetPeriodData?.targetCount ?? 0
  const periodLabel = `${getMonthName(targetPeriod.month)} ${targetPeriod.year}`

  return (
    <div className="space-y-6">
      <TargetCountCard targetCount={targetCount} periodLabel={periodLabel} />
      <PageSection
        title="Bir Sonraki Ay Hedef"
        description={`${periodLabel} için canlıya alınması hedeflenen markalar`}
      >
        <TargetBrandsList data={pendingTargets} showStatus={false} />
      </PageSection>
    </div>
  )
}
