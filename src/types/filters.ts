export type DashboardTab = 'monthly' | 'comparison' | 'cohort' | 'top-firms' | 'realized-targets' | 'x-month-target' | 'team'

export interface FilterState {
  year: number
  month: number | null
  comparisonYear: number
  selectedTeamMemberId: string | null
  selectedSegment: string | null
}
