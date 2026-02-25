export interface CohortCell {
  goLiveMonth: string
  observedMonth: string
  gpvValue: number
}

export interface CohortRow {
  goLiveMonth: string
  firmCount: number
  cells: CohortCell[]
  topFirms: TopCohortFirm[]
}

export interface TopCohortFirm {
  name: string
  gpv: number
}

export interface CohortMatrix {
  rows: CohortRow[]
  months: string[]
}
