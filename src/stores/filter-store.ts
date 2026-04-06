import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
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
const FILTER_STORAGE_KEY = 'spreports-filters-v1'

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: FILTER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        year: state.year,
        month: state.month,
        comparisonYear: state.comparisonYear,
        selectedTeamMemberId: state.selectedTeamMemberId,
      }),
    },
  ),
)
