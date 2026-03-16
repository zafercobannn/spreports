export type TargetStatus = 'live' | 'not-live'

export interface TargetBrand {
  name: string
  sector: string
  estimatedRevenue: string
  status: TargetStatus
}
