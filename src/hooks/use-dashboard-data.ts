import { useEffect, useMemo } from 'react'
import { useFilters } from './use-filters'
import { deriveCohortWindow, getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import type { CohortMatrix } from '@/types/cohort'

export function useDashboardPeriodData() {
  const { year, month } = useFilters()
  const periodKey = getPeriodKey(year, month)
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)
  const periodData = useDashboardDataStore((s) => s.periods[periodKey])

  useEffect(() => {
    ensurePeriod(year, month)
  }, [ensurePeriod, year, month])

  return periodData
}

/**
 * Cohort verisi tek kaynaktan (global) gelir; burada ilgili dönemin 6 aylık
 * penceresi türetilir. Dönem dokümanlarına bağlı olmadığından hiçbir ayda
 * sıfırlanmaz.
 */
export function useCohortForPeriod(year: number, month: number): CohortMatrix {
  const ensureCohort = useDashboardDataStore((s) => s.ensureCohort)
  const cohortAll = useDashboardDataStore((s) => s.cohortAll)

  useEffect(() => {
    ensureCohort()
  }, [ensureCohort])

  return useMemo(() => deriveCohortWindow(cohortAll, year, month), [cohortAll, year, month])
}
