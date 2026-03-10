export interface TeamMember {
  id: string
  name: string
  role?: string
}

export interface RepresentativeSuccessRecord {
  id: string
  name: string
  liveCount: number
  liveTarget: number
  auditScore: number
  npsScore: number
  avgGoLiveDurationDays: number
  meetingScore: number
  imageUrl?: string
}

export interface RepresentativeSuccessWeights {
  liveCount: number
  auditScore: number
  npsScore: number
  meetingScore: number
}

export interface TeamMemberPerformance {
  member: TeamMember
  assignedCount: number
  completedCount: number
  completionRate: number
  avgDurationDays: number
  successScore: number
}

export interface MonthlyTarget {
  metricName: string
  targetValue: number
  actualValue: number
  unit: string
}

export interface TeamSuccessIndex {
  overallScore: number
  metrics: TeamSuccessMetric[]
}

export interface TeamSuccessMetric {
  label: string
  value: number
  weight: number
}
