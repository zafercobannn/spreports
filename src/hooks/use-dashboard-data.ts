import { useEffect } from 'react'
import { useFilters } from './use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'

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
