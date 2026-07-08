import { useEffect, useMemo } from 'react'
import { RepresentativeSuccessBoard } from './RepresentativeSuccessBoard'
import { ScopeSelector } from '@/components/filters/ScopeSelector'
import { usePeriodScope } from '@/hooks/use-period-scope'
import { getMonthName } from '@/utils/date-utils'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import {
  aggregateRep,
  getPeriodKeysForSelection,
  listRepresentativesAcrossPeriods,
  pickWeights,
  selectionEffectiveMonth,
} from '@/features/representative-compare/comparison-utils'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { RepresentativeSuccessRecord } from '@/types/team'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

interface TeamLeaderboardSectionProps {
  month: number
  year: number
  monthlyPeriodData: DashboardPeriodData
  onSelectRep: (name: string) => void
}

export function TeamLeaderboardSection({ month, year, monthlyPeriodData, onSelectRep }: TeamLeaderboardSectionProps) {
  const periods = useDashboardDataStore((s) => s.periods)
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)
  const periodScope = usePeriodScope(year, month)
  const { scope, selection, selectedQuarter } = periodScope

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
      <div className="flex justify-end">
        <ScopeSelector periodScope={periodScope} />
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
