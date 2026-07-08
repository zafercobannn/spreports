import { useMemo, useState } from 'react'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import type { PeriodSelection, Scope } from '@/utils/period-selection'

export interface PeriodScope {
  scope: Scope
  setScope: (scope: Scope) => void
  selectedYear: number
  setYearOverride: (year: number) => void
  selectedQuarter: number
  setSelectedQuarter: (quarter: number) => void
  yearOptions: number[]
  selection: PeriodSelection
}

/** Aylık/Çeyreklik/Yıllık kapsam seçimini yönetir; global ay/yıl filtresi "Aylık" modun varsayılanıdır. */
export function usePeriodScope(year: number, month: number): PeriodScope {
  const periods = useDashboardDataStore((s) => s.periods)

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

  return {
    scope,
    setScope,
    selectedYear,
    setYearOverride,
    selectedQuarter,
    setSelectedQuarter,
    yearOptions,
    selection,
  }
}
