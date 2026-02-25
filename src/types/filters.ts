export type DashboardTab = 'monthly' | 'cohort' | 'top-firms' | 'targets' | 'team'

export interface FilterState {
  year: number
  month: number | null
  comparisonYear: number
  selectedTeamMemberId: string | null
  selectedSegment: string | null
}
