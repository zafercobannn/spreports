import { useEffect, useMemo, useState } from 'react'
import { RepresentativeSuccessBoard } from './RepresentativeSuccessBoard'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { cn } from '@/lib/utils'
import { getMonthName } from '@/utils/date-utils'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import {
  aggregateRep,
  getPeriodKeysForSelection,
  listRepresentativesAcrossPeriods,
  pickWeights,
  selectionEffectiveMonth,
  type PeriodSelection,
  type Scope,
} from '@/features/representative-compare/comparison-utils'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { RepresentativeSuccessRecord } from '@/types/team'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const SCOPE_OPTIONS: { id: Scope; label: string }[] = [
  { id: 'monthly', label: 'Aylık' },
  { id: 'quarterly', label: 'Çeyreklik' },
  { id: 'yearly', label: 'Yıllık' },
]

interface TeamLeaderboardSectionProps {
  month: number
  year: number
  monthlyPeriodData: DashboardPeriodData
  onSelectRep: (name: string) => void
}

export function TeamLeaderboardSection({ month, year, monthlyPeriodData, onSelectRep }: TeamLeaderboardSectionProps) {
  const periods = useDashboardDataStore((s) => s.periods)
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const [scope, setScope] = useState<Scope>('monthly')
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil(month / 3))
  const [yearOverride, setYearOverride] = useState<number | null>(null)
  const selectedYear = yearOverride ?? year

  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    for (const key of Object.keys(periods)) {
      const y = Number(key.split('-')[0])
      if (Number.isFinite(y)) years.add(y)
    }
    years.add(year)
    return Array.from(years).sort((a, b) => b - a)
  }, [periods, year])

  const selection = useMemo<PeriodSelection>(() => {
    if (scope === 'monthly') return { scope, year, value: month }
    if (scope === 'quarterly') return { scope, year: selectedYear, value: selectedQuarter }
    return { scope, year: selectedYear, value: 1 }
  }, [scope, year, month, selectedYear, selectedQuarter])

  const periodKeys = useMemo(() => getPeriodKeysForSelection(selection), [selection])

  useEffect(() => {
    if (scope === 'monthly') return
    periodKeys.forEach((key) => {
      const [yStr, mStr] = key.split('-')
      const y = Number(yStr)
      const m = Number(mStr)
      if (Number.isFinite(y) && Number.isFinite(m)) void ensurePeriod(y, m)
    })
  }, [scope, periodKeys, ensurePeriod])

  const board = useMemo(() => {
    if (scope === 'monthly') {
      const autoRealizedCount = monthlyPeriodData.targets.filter((target) => target.status === 'live').length
      return {
        data: monthlyPeriodData.representativeSuccess,
        weights: monthlyPeriodData.representativeWeights,
        effYear: year,
        effMonth: month,
        monthLabel: getMonthName(month),
        trackedTargetCount: monthlyPeriodData.targetCount,
        trackedRealizedCount: monthlyPeriodData.realizedCount ?? autoRealizedCount,
      }
    }

    const names = listRepresentativesAcrossPeriods(selection, periods)
    const data: RepresentativeSuccessRecord[] = names
      .map((name) => aggregateRep(name, selection, periods))
      .filter((rep): rep is NonNullable<typeof rep> => rep !== null)
      .map((rep) => ({
        id: rep.name,
        name: rep.name,
        liveCount: rep.liveCount,
        liveTarget: rep.liveTarget,
        auditScore: rep.auditScore,
        npsScore: rep.npsScore,
        csatScore: rep.csatScore,
        meetingScore: rep.meetingScore,
        avgGoLiveDurationDays: rep.avgGoLiveDurationDays,
        imageUrl: rep.imageUrl,
      }))

    let trackedTargetCount = 0
    let trackedRealizedCount = 0
    periodKeys.forEach((key) => {
      const p = periods[key]
      if (!p) return
      trackedTargetCount += p.targetCount
      trackedRealizedCount += p.realizedCount ?? p.targets.filter((target) => target.status === 'live').length
    })

    return {
      data,
      weights: pickWeights(selection),
      effYear: selection.year,
      effMonth: selectionEffectiveMonth(selection),
      monthLabel: scope === 'quarterly' ? QUARTERS[selectedQuarter - 1] : 'Yıllık',
      trackedTargetCount,
      trackedRealizedCount,
    }
  }, [scope, selection, periods, periodKeys, monthlyPeriodData, year, month, selectedQuarter])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-1">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cn(
                'rounded-full px-3 py-1 text-[12px] font-medium transition-colors',
                scope === opt.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setScope(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {scope !== 'monthly' && (
          <SearchableSelect
            value={selectedYear}
            onChange={(v) => setYearOverride(Number(v))}
            options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
            triggerClassName="h-8 text-[12px]"
          />
        )}

        {scope === 'quarterly' && (
          <SearchableSelect
            value={selectedQuarter}
            onChange={(v) => setSelectedQuarter(Number(v))}
            options={QUARTERS.map((q, i) => ({ value: i + 1, label: q }))}
            triggerClassName="h-8 text-[12px]"
            popoverClassName="min-w-[100px]"
          />
        )}
      </div>

      <RepresentativeSuccessBoard
        data={board.data}
        weights={board.weights}
        month={board.effMonth}
        monthLabel={board.monthLabel}
        trackedRealizedCount={board.trackedRealizedCount}
        trackedTargetCount={board.trackedTargetCount}
        year={board.effYear}
        onSelectRep={onSelectRep}
      />
    </div>
  )
}
