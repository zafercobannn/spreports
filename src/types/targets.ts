export type TargetStatus = 'live' | 'not-live'

export interface TargetBrand {
  name: string
  sector: string
  estimatedRevenue: number
  status: TargetStatus
}
