import type { MonthlyGPV } from '@/types/gpv'
import type { CohortMatrix } from '@/types/cohort'
import type { TopFirm } from '@/types/firms'
import type { TargetBrand } from '@/types/targets'
import type {
  TeamMemberPerformance,
  MonthlyTarget,
  TeamSuccessIndex,
  RepresentativeSuccessRecord,
  RepresentativeSuccessWeights,
} from '@/types/team'

export const MOCK_MONTHLY_GPV: MonthlyGPV = {
  month: 1,
  year: 2026,
  ikasGPV: 850_000_000,
  spGPV: 127_500_000,
  gpvRatio: 15,
  liveAccountCount: 892,
  monthlyLiveCount: 134,
  totalSP: 125,
  premiumOnboardingLiveCount: 7,
  avgGoLiveDurationDays: 12.5,
  previousPlatforms: [
    { name: 'Shopify', count: 38 },
    { name: 'WooCommerce', count: 29 },
    { name: 'Ticimax', count: 22 },
    { name: 'T-Soft', count: 18 },
    { name: 'IdeaSoft', count: 15 },
    { name: 'Diğer', count: 12 },
  ],
}

export const MOCK_COHORT: CohortMatrix = {
  months: ['Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak'],
  rows: [
    {
      goLiveMonth: 'Ağustos',
      firmCount: 105,
      cells: [
        { goLiveMonth: 'Ağustos', observedMonth: 'Ağustos', gpvValue: 6_000_000 },
        { goLiveMonth: 'Ağustos', observedMonth: 'Eylül', gpvValue: 17_400_000 },
        { goLiveMonth: 'Ağustos', observedMonth: 'Ekim', gpvValue: 20_000_000 },
        { goLiveMonth: 'Ağustos', observedMonth: 'Kasım', gpvValue: 23_000_000 },
        { goLiveMonth: 'Ağustos', observedMonth: 'Aralık', gpvValue: 23_800_000 },
        { goLiveMonth: 'Ağustos', observedMonth: 'Ocak', gpvValue: 22_500_000 },
      ],
      topFirms: [{ name: 'ebruyk', gpv: 4_833_173 }, { name: 'vitamarker', gpv: 878_853 }, { name: 'karspeynircilik', gpv: 916_907 }],
    },
    {
      goLiveMonth: 'Eylül',
      firmCount: 149,
      cells: [
        { goLiveMonth: 'Eylül', observedMonth: 'Ağustos', gpvValue: 0 },
        { goLiveMonth: 'Eylül', observedMonth: 'Eylül', gpvValue: 15_600_000 },
        { goLiveMonth: 'Eylül', observedMonth: 'Ekim', gpvValue: 25_300_000 },
        { goLiveMonth: 'Eylül', observedMonth: 'Kasım', gpvValue: 31_000_000 },
        { goLiveMonth: 'Eylül', observedMonth: 'Aralık', gpvValue: 34_700_000 },
        { goLiveMonth: 'Eylül', observedMonth: 'Ocak', gpvValue: 39_700_000 },
      ],
      topFirms: [{ name: 'samseygiyim1', gpv: 666_041 }, { name: 'fatmaanadan', gpv: 706_813 }, { name: 'softpurescarfs', gpv: 2_527_350 }],
    },
    {
      goLiveMonth: 'Ekim',
      firmCount: 170,
      cells: [
        { goLiveMonth: 'Ekim', observedMonth: 'Ağustos', gpvValue: 0 },
        { goLiveMonth: 'Ekim', observedMonth: 'Eylül', gpvValue: 0 },
        { goLiveMonth: 'Ekim', observedMonth: 'Ekim', gpvValue: 15_600_000 },
        { goLiveMonth: 'Ekim', observedMonth: 'Kasım', gpvValue: 57_000_000 },
        { goLiveMonth: 'Ekim', observedMonth: 'Aralık', gpvValue: 46_000_000 },
        { goLiveMonth: 'Ekim', observedMonth: 'Ocak', gpvValue: 43_000_000 },
      ],
      topFirms: [{ name: 'missdoping', gpv: 910_467 }, { name: 'petgrosstr', gpv: 961_292 }, { name: 'malikhan', gpv: 650_254 }],
    },
    {
      goLiveMonth: 'Kasım',
      firmCount: 131,
      cells: [
        { goLiveMonth: 'Kasım', observedMonth: 'Ağustos', gpvValue: 0 },
        { goLiveMonth: 'Kasım', observedMonth: 'Eylül', gpvValue: 0 },
        { goLiveMonth: 'Kasım', observedMonth: 'Ekim', gpvValue: 0 },
        { goLiveMonth: 'Kasım', observedMonth: 'Kasım', gpvValue: 10_500_000 },
        { goLiveMonth: 'Kasım', observedMonth: 'Aralık', gpvValue: 19_000_000 },
        { goLiveMonth: 'Kasım', observedMonth: 'Ocak', gpvValue: 22_000_000 },
      ],
      topFirms: [{ name: 'elagancewear', gpv: 875_854 }, { name: 'analinayakkabi', gpv: 457_497 }, { name: 'missdoping', gpv: 910_467 }],
    },
    {
      goLiveMonth: 'Aralık',
      firmCount: 152,
      cells: [
        { goLiveMonth: 'Aralık', observedMonth: 'Ağustos', gpvValue: 0 },
        { goLiveMonth: 'Aralık', observedMonth: 'Eylül', gpvValue: 0 },
        { goLiveMonth: 'Aralık', observedMonth: 'Ekim', gpvValue: 0 },
        { goLiveMonth: 'Aralık', observedMonth: 'Kasım', gpvValue: 0 },
        { goLiveMonth: 'Aralık', observedMonth: 'Aralık', gpvValue: 10_000_000 },
        { goLiveMonth: 'Aralık', observedMonth: 'Ocak', gpvValue: 31_000_000 },
      ],
      topFirms: [{ name: 'ebruyk', gpv: 1_614_006 }, { name: 'vitamarker', gpv: 1_379_179 }, { name: 'karspeynircilik', gpv: 1_057_569 }],
    },
    {
      goLiveMonth: 'Ocak',
      firmCount: 134,
      cells: [
        { goLiveMonth: 'Ocak', observedMonth: 'Ağustos', gpvValue: 0 },
        { goLiveMonth: 'Ocak', observedMonth: 'Eylül', gpvValue: 0 },
        { goLiveMonth: 'Ocak', observedMonth: 'Ekim', gpvValue: 0 },
        { goLiveMonth: 'Ocak', observedMonth: 'Kasım', gpvValue: 0 },
        { goLiveMonth: 'Ocak', observedMonth: 'Aralık', gpvValue: 0 },
        { goLiveMonth: 'Ocak', observedMonth: 'Ocak', gpvValue: 7_000_000 },
      ],
      topFirms: [{ name: 'softpurescarfs', gpv: 2_527_350 }, { name: 'petgrosstr', gpv: 961_292 }, { name: 'missdoping', gpv: 910_467 }],
    },
  ],
}

export const MOCK_TOP_FIRMS: TopFirm[] = [
  { rank: 1, name: 'ebruyk', gpv: 4_833_173.28, previousMonthGPV: 1_614_006.71, gpvChange: 199.5, shipmentSent: 1240, ikasCargoValue: 978, parsUsageRate: 71 },
  { rank: 2, name: 'softpurescarfs', gpv: 2_527_350.17, previousMonthGPV: 546_482.63, gpvChange: 362.5, shipmentSent: 890, ikasCargoValue: 815, parsUsageRate: 83 },
  { rank: 3, name: 'petgrosstr', gpv: 961_292.56, previousMonthGPV: 337_720.99, gpvChange: 184.6, shipmentSent: 456, ikasCargoValue: 352, parsUsageRate: 79 },
  { rank: 4, name: 'karspeynircilik', gpv: 916_907.51, previousMonthGPV: 1_057_569.34, gpvChange: -13.3, shipmentSent: 320, ikasCargoValue: 198, parsUsageRate: 54 },
  { rank: 5, name: 'missdoping', gpv: 910_467.92, previousMonthGPV: 344_506.50, gpvChange: 164.3, shipmentSent: 678, ikasCargoValue: 604, parsUsageRate: 75 },
  { rank: 6, name: 'vitamarker', gpv: 878_853.27, previousMonthGPV: 1_379_179.43, gpvChange: -36.3, shipmentSent: 210, ikasCargoValue: 0, parsUsageRate: 38 },
  { rank: 7, name: 'elagancewear', gpv: 875_854.78, previousMonthGPV: 0, gpvChange: 100, shipmentSent: 345, ikasCargoValue: 247, parsUsageRate: 63 },
  { rank: 8, name: 'fatmaanadan', gpv: 706_813.04, previousMonthGPV: 571_622.03, gpvChange: 23.6, shipmentSent: 189, ikasCargoValue: 92, parsUsageRate: 49 },
  { rank: 9, name: 'samseygiyim1', gpv: 666_041.25, previousMonthGPV: 779_224.39, gpvChange: -14.5, shipmentSent: 278, ikasCargoValue: 201, parsUsageRate: 69 },
  { rank: 10, name: 'malikhan', gpv: 650_254.88, previousMonthGPV: 292_140.23, gpvChange: 122.6, shipmentSent: 156, ikasCargoValue: 97, parsUsageRate: 57 },
  { rank: 11, name: 'analinayakkabi', gpv: 457_497.17, previousMonthGPV: 534_751.43, gpvChange: -14.4, shipmentSent: 134, ikasCargoValue: 88, parsUsageRate: 53 },
  { rank: 12, name: 'shopABC', gpv: 420_000, previousMonthGPV: 380_000, gpvChange: 10.5, shipmentSent: 220, ikasCargoValue: 164, parsUsageRate: 66 },
  { rank: 13, name: 'modaStore', gpv: 385_000, previousMonthGPV: 350_000, gpvChange: 10.0, shipmentSent: 198, ikasCargoValue: 155, parsUsageRate: 72 },
  { rank: 14, name: 'greenLife', gpv: 340_000, previousMonthGPV: 310_000, gpvChange: 9.7, shipmentSent: 145, ikasCargoValue: 0, parsUsageRate: 61 },
  { rank: 15, name: 'techMart', gpv: 310_000, previousMonthGPV: 290_000, gpvChange: 6.9, shipmentSent: 167, ikasCargoValue: 142, parsUsageRate: 80 },
]

export const MOCK_TARGETS: TargetBrand[] = [
  { name: 'BrandX Fashion', sector: 'Moda', estimatedRevenue: 5_000_000, status: 'live' },
  { name: 'TechGadgets Pro', sector: 'Elektronik', estimatedRevenue: 3_200_000, status: 'live' },
  { name: 'OrganikMarket', sector: 'Gıda', estimatedRevenue: 2_800_000, status: 'pending' },
  { name: 'PetWorld', sector: 'Pet', estimatedRevenue: 1_500_000, status: 'pending' },
  { name: 'HomeDecor Plus', sector: 'Ev & Yaşam', estimatedRevenue: 4_100_000, status: 'live' },
  { name: 'SportZone', sector: 'Spor', estimatedRevenue: 2_600_000, status: 'pending' },
  { name: 'BabyLand', sector: 'Anne & Bebek', estimatedRevenue: 1_900_000, status: 'lost' },
  { name: 'BookNest', sector: 'Kitap', estimatedRevenue: 800_000, status: 'pending' },
]

export const MOCK_TEAM_PERFORMANCE: TeamMemberPerformance[] = [
  { member: { id: '1', name: 'Ahmet Y.' }, assignedCount: 18, completedCount: 15, completionRate: 83, avgDurationDays: 11, successScore: 87 },
  { member: { id: '2', name: 'Elif K.' }, assignedCount: 22, completedCount: 20, completionRate: 91, avgDurationDays: 9, successScore: 94 },
  { member: { id: '3', name: 'Mehmet S.' }, assignedCount: 15, completedCount: 12, completionRate: 80, avgDurationDays: 14, successScore: 78 },
  { member: { id: '4', name: 'Zeynep B.' }, assignedCount: 20, completedCount: 18, completionRate: 90, avgDurationDays: 10, successScore: 92 },
  { member: { id: '5', name: 'Can D.' }, assignedCount: 17, completedCount: 14, completionRate: 82, avgDurationDays: 13, successScore: 80 },
]

export const MOCK_MONTHLY_TARGETS: MonthlyTarget[] = [
  { metricName: 'Canlıya Alınan Firma', targetValue: 150, actualValue: 134, unit: 'firma' },
  { metricName: 'Ortalama Süre', targetValue: 10, actualValue: 12.5, unit: 'gün' },
  { metricName: 'SP GPV', targetValue: 150_000_000, actualValue: 127_500_000, unit: 'TRY' },
  { metricName: 'Müşteri Memnuniyeti', targetValue: 90, actualValue: 87, unit: '%' },
  { metricName: 'ikas Kargo Kullanımı', targetValue: 80, actualValue: 72, unit: '%' },
]

export const MOCK_SUCCESS_INDEX: TeamSuccessIndex = {
  overallScore: 86,
  metrics: [
    { label: 'Tamamlanma Oranı', value: 88, weight: 30 },
    { label: 'Hız (Süre)', value: 82, weight: 25 },
    { label: 'GPV Büyümesi', value: 91, weight: 25 },
    { label: 'Müşteri Memnuniyeti', value: 85, weight: 20 },
  ],
}

export const MOCK_REPRESENTATIVE_SUCCESS_WEIGHTS: RepresentativeSuccessWeights = {
  liveCount: 30,
  auditScore: 30,
  npsScore: 20,
  meetingScore: 20,
}

export const MOCK_REPRESENTATIVE_SUCCESS: RepresentativeSuccessRecord[] = [
  {
    id: 'rep-1',
    name: 'Dilşad Gergin',
    liveCount: 53,
    liveTarget: 45,
    auditScore: 75,
    npsScore: 4.22,
    meetingScore: 4.92,
  },
  {
    id: 'rep-2',
    name: 'Ahmet Onur Yarıcı',
    liveCount: 30,
    liveTarget: 26,
    auditScore: 90,
    npsScore: 4.6,
    meetingScore: 4.97,
  },
  {
    id: 'rep-3',
    name: 'Tolga Özen Kabasakal',
    liveCount: 26,
    liveTarget: 26,
    auditScore: 95,
    npsScore: 5,
    meetingScore: 4.95,
  },
  {
    id: 'rep-4',
    name: 'Hüseyin Günder',
    liveCount: 24,
    liveTarget: 26,
    auditScore: 75,
    npsScore: 4.57,
    meetingScore: 5,
  },
]
