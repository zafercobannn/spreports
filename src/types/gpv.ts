export interface MonthlyGPV {
  month: number
  year: number
  ikasGPV: number
  spGPV: number
  gpvRatio: number
  liveAccountCount: number
  monthlyLiveCount: number
  totalSP: number
  premiumOnboardingLiveCount: number
  avgGoLiveDurationDays: number
  previousPlatforms: PlatformCount[]
}

export interface PlatformCount {
  name: string
  count: number
}

export interface GPVTrendPoint {
  month: string
  ikasGPV: number
  spGPV: number
}
