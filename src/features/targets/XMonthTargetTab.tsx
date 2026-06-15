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
    <div className="lin-section p-[18px]" style={{ background: 'linear-gradient(135deg, var(--color-accent-soft), var(--color-surface))' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">
          <Target className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">{periodLabel}</p>
          <p className="font-mono text-[22px] font-semibold tracking-[-0.02em] text-foreground tabular">
            {targetCount > 0 ? targetCount : '—'}
            <span className="ml-2 font-sans text-[13px] font-normal text-muted-foreground">adet hedef</span>
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

  // Etiket için bir sonraki ay (ör. Nisan'dayken "Mayıs ... hedeflenen markalar")
  const targetPeriod = useMemo(() => getOffsetPeriod(year, month, 1), [year, month])

  useEffect(() => {
    ensurePeriod(year, month)
  }, [ensurePeriod, year, month])

  // Bu ayın "Canlı Değil" markaları = bir sonraki ay canlıya alınması hedeflenen markalar
  const pendingTargets = useMemo(
    () => (currentPeriodData?.targets ?? []).filter((t) => t.status !== 'live'),
    [currentPeriodData?.targets],
  )

  const targetCount = pendingTargets.length
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
