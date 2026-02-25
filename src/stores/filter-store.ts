import { create } from 'zustand'
import { getCurrentMonth, getCurrentYear } from '@/utils/date-utils'

interface FilterState {
  year: number
  month: number
  comparisonYear: number
  selectedTeamMemberId: string | null

  setYear: (year: number) => void
  setMonth: (month: number) => void
  setComparisonYear: (year: number) => void
  setTeamMember: (id: string | null) => void
  resetFilters: () => void
}

const currentYear = getCurrentYear()
const currentMonth = getCurrentMonth()

export const useFilterStore = create<FilterState>()((set) => ({
  year: currentYear,
  month: currentMonth,
  comparisonYear: currentYear - 1,
  selectedTeamMemberId: null,

  setYear: (year) => set({ year, comparisonYear: year - 1 }),
  setMonth: (month) => set({ month }),
  setComparisonYear: (comparisonYear) => set({ comparisonYear }),
  setTeamMember: (id) => set({ selectedTeamMemberId: id }),
  resetFilters: () =>
    set({
      year: currentYear,
      month: currentMonth,
      comparisonYear: currentYear - 1,
      selectedTeamMemberId: null,
    }),
}))
