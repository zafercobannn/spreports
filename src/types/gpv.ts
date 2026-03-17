export interface MonthlyGPV {
  month: number
  year: number
  ikasGPV: number
  spGPV: number
  gpvRatio: number
  liveAccountCount: number
  liveSPCount: number
  monthlyLiveCount: number
  totalSP: number
  premiumOnboardingLiveCount: number
  premiumOnboardingAvgGoLiveDurationDays: number
  scalePlusAvgGoLiveDurationDays: number
  previousPlatformsSP: PlatformCount[]
  previousPlatformsPremiumOnboarding: PlatformCount[]
  gpvShare: number
  shikasShare: number
  liveSPShare: number
  // Legacy alanlar: eski local veriyi bozmayalım.
  avgGoLiveDurationDays?: number
  previousPlatforms?: PlatformCount[]
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
