import { useEffect, useMemo } from 'react'
import { Target } from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'
import { ScopeSelector } from '@/components/filters/ScopeSelector'
import { useFilters } from '@/hooks/use-filters'
import { usePeriodScope } from '@/hooks/use-period-scope'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import { describeSelection, getPeriodKeysForSelection } from '@/utils/period-selection'
import { aggregateTargets } from '@/utils/period-aggregate'
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
  const periodScope = usePeriodScope(year, month)
  const { scope, selection } = periodScope
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)
  const periods = useDashboardDataStore((s) => s.periods)

  const periodKeys = useMemo(() => getPeriodKeysForSelection(selection), [selection])

  // "Bir sonraki ay" etiketi sadece Aylık modda anlamlı (ör. Nisan'dayken "Mayıs ... hedeflenen markalar").
  // Çeyreklik/Yıllık modda "bir sonraki çeyrek/yıl" yerine seçili dönemin kendisi gösterilir.
  const targetPeriod = useMemo(() => getOffsetPeriod(year, month, 1), [year, month])

  useEffect(() => {
    periodKeys.forEach((key) => {
      const [yStr, mStr] = key.split('-')
      const y = Number(yStr)
      const m = Number(mStr)
      if (Number.isFinite(y) && Number.isFinite(m)) void ensurePeriod(y, m)
    })
  }, [periodKeys, ensurePeriod])

  // Seçili dönemdeki (dedup'lanmış) "Canlı Değil" markalar
  const pendingTargets = useMemo(
    () => aggregateTargets(selection, periods).targets.filter((t) => t.status !== 'live'),
    [selection, periods],
  )

  const targetCount = pendingTargets.length
  const isMonthly = scope === 'monthly'
  const periodLabel = isMonthly ? `${getMonthName(targetPeriod.month)} ${targetPeriod.year}` : describeSelection(selection)
  const title = isMonthly ? 'Bir Sonraki Ay Hedef' : 'Bu Dönemde Canlı Olmayanlar'
  const description = isMonthly
    ? `${periodLabel} için canlıya alınması hedeflenen markalar`
    : `${periodLabel} döneminde henüz canlıya alınmamış markalar`

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ScopeSelector periodScope={periodScope} />
      </div>
      <TargetCountCard targetCount={targetCount} periodLabel={periodLabel} />
      <PageSection title={title} description={description}>
        <TargetBrandsList data={pendingTargets} showStatus={false} />
      </PageSection>
    </div>
  )
}
