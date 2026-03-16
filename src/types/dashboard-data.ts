import type { CohortMatrix } from './cohort'
import type { TopFirm } from './firms'
import type { MonthlyGPV } from './gpv'
import type { TargetBrand } from './targets'
import type {
  MonthlyTarget,
  TeamMemberPerformance,
  TeamSuccessIndex,
  RepresentativeSuccessRecord,
  RepresentativeSuccessWeights,
} from './team'

export interface DashboardPeriodData {
  monthlyGPV: MonthlyGPV
  cohort: CohortMatrix
  topFirms: TopFirm[]
  targets: TargetBrand[]
  targetCount: number
  realizedCount: number | null
  teamPerformance: TeamMemberPerformance[]
  representativeSuccess: RepresentativeSuccessRecord[]
  representativeWeights: RepresentativeSuccessWeights
  monthlyTargets: MonthlyTarget[]
  successIndex: TeamSuccessIndex
}
