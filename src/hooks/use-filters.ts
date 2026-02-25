import { useFilterStore } from '@/stores/filter-store'
import { useShallow } from 'zustand/react/shallow'

export function useFilters() {
  return useFilterStore(
    useShallow((s) => ({
      year: s.year,
      month: s.month,
      comparisonYear: s.comparisonYear,
      selectedTeamMemberId: s.selectedTeamMemberId,
    }))
  )
}

export function useFilterActions() {
  return useFilterStore(
    useShallow((s) => ({
      setYear: s.setYear,
      setMonth: s.setMonth,
      setComparisonYear: s.setComparisonYear,
      setTeamMember: s.setTeamMember,
      resetFilters: s.resetFilters,
    }))
  )
}
