export type TargetStatus = 'live' | 'pending' | 'lost'

export interface TargetBrand {
  name: string
  sector: string
  estimatedRevenue: number
  status: TargetStatus
}
