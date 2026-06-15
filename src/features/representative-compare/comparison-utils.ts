import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import { getDefaultRepresentativeWeights, calculateRepresentativeMetrics, isRepresentativeCsatPeriod } from '@/features/team-performance/representative-success-utils'
import { getPeriodKey } from '@/stores/dashboard-data-store'
import type { DashboardPeriodData } from '@/types/dashboard-data'

export type Scope = 'monthly' | 'quarterly' | 'yearly'

export interface PeriodSelection {
  scope: Scope
  year: number
  /** month (1-12) for monthly | quarter (1-4) for quarterly | unused for yearly */
  value: number
}

export function getPeriodKeysForSelection(selection: PeriodSelection): string[] {
  const { scope, year, value } = selection
  if (scope === 'monthly') return [getPeriodKey(year, value)]
  if (scope === 'quarterly') {
    const start = (value - 1) * 3 + 1
    return [getPeriodKey(year, start), getPeriodKey(year, start + 1), getPeriodKey(year, start + 2)]
  }
  return Array.from({ length: 12 }, (_, i) => getPeriodKey(year, i + 1))
}

export function describeSelection(selection: PeriodSelection): string {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  if (selection.scope === 'monthly') return `${months[selection.value - 1] ?? ''} ${selection.year}`
  if (selection.scope === 'quarterly') return `Q${selection.value} ${selection.year}`
  return `${selection.year} (Yıllık)`
}

export interface AggregatedRep {
  name: string
  imageUrl?: string
  liveCount: number
  liveTarget: number
  auditScore: number
  npsScore: number
  csatScore: number
  meetingScore: number
  avgGoLiveDurationDays: number
  /** Number of months this aggregate covers (for averaged fields) */
  coveredMonths: number
  /** True if any underlying period uses the CSAT model */
  usesCsat: boolean
  successIndex: number
}

function pickWeights(selection: PeriodSelection): RepresentativeSuccessWeights {
  if (selection.scope === 'monthly') return getDefaultRepresentativeWeights(selection.year, selection.value)
  if (selection.scope === 'quarterly') {
    const start = (selection.value - 1) * 3 + 1
    return getDefaultRepresentativeWeights(selection.year, start + 2)
  }
  return getDefaultRepresentativeWeights(selection.year, 12)
}

function selectionEffectiveMonth(selection: PeriodSelection): number {
  if (selection.scope === 'monthly') return selection.value
  if (selection.scope === 'quarterly') return (selection.value - 1) * 3 + 3
  return 12
}

export function aggregateRep(
  name: string,
  selection: PeriodSelection,
  periods: Record<string, DashboardPeriodData | undefined>,
): AggregatedRep | null {
  const keys = getPeriodKeysForSelection(selection)
  const records: { record: RepresentativeSuccessRecord; year: number; month: number }[] = []
  for (const key of keys) {
    const reps = periods[key]?.representativeSuccess ?? []
    const found = reps.find((r) => r.name === name)
    if (!found) continue
    const [yStr, mStr] = key.split('-')
    records.push({ record: found, year: Number(yStr), month: Number(mStr) })
  }
  if (records.length === 0) return null

  const sum = (pick: (r: RepresentativeSuccessRecord) => number) =>
    records.reduce((acc, item) => acc + (Number.isFinite(pick(item.record)) ? pick(item.record) : 0), 0)
  const avg = (pick: (r: RepresentativeSuccessRecord) => number) =>
    sum(pick) / records.length

  const usesCsat = records.some((r) => isRepresentativeCsatPeriod(r.year, r.month))

  const aggregated: RepresentativeSuccessRecord = {
    id: records[0].record.id,
    name,
    liveCount: sum((r) => r.liveCount),
    liveTarget: sum((r) => r.liveTarget),
    auditScore: avg((r) => r.auditScore),
    npsScore: avg((r) => r.npsScore),
    csatScore: avg((r) => r.csatScore),
    meetingScore: avg((r) => r.meetingScore),
    avgGoLiveDurationDays: avg((r) => r.avgGoLiveDurationDays),
    imageUrl: records[0].record.imageUrl,
  }

  const weights = pickWeights(selection)
  const successIndex = calculateRepresentativeMetrics(
    aggregated,
    weights,
    selection.year,
    selectionEffectiveMonth(selection),
  ).successIndex

  return {
    name,
    imageUrl: records[0].record.imageUrl,
    liveCount: aggregated.liveCount,
    liveTarget: aggregated.liveTarget,
    auditScore: aggregated.auditScore,
    npsScore: aggregated.npsScore,
    csatScore: aggregated.csatScore,
    meetingScore: aggregated.meetingScore,
    avgGoLiveDurationDays: aggregated.avgGoLiveDurationDays,
    coveredMonths: records.length,
    usesCsat,
    successIndex,
  }
}

export function listRepresentativesAcrossPeriods(
  selection: PeriodSelection,
  periods: Record<string, DashboardPeriodData | undefined>,
): string[] {
  const keys = getPeriodKeysForSelection(selection)
  const set = new Set<string>()
  for (const key of keys) {
    for (const r of periods[key]?.representativeSuccess ?? []) {
      if (r.name?.trim()) set.add(r.name.trim())
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))
}

export interface MetricRow {
  label: string
  /** Format the number for display */
  format: (n: number) => string
  leftValue: number
  rightValue: number
  /** When true: higher is better (default). false → lower is better */
  higherIsBetter: boolean
}

export function buildMetricRows(left: AggregatedRep, right: AggregatedRep): MetricRow[] {
  const usesCsat = left.usesCsat || right.usesCsat
  const fmtNum = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 1 })
  const fmtPercent = (n: number) => `%${n.toFixed(1)}`

  const rows: MetricRow[] = [
    {
      label: 'Başarı Endeksi',
      format: (n) => n.toFixed(1),
      leftValue: left.successIndex,
      rightValue: right.successIndex,
      higherIsBetter: true,
    },
    {
      label: 'Audit Skoru',
      format: (n) => `${n.toFixed(1)}/100`,
      leftValue: left.auditScore,
      rightValue: right.auditScore,
      higherIsBetter: true,
    },
    {
      label: 'Canlıya Alınan',
      format: fmtNum,
      leftValue: left.liveCount,
      rightValue: right.liveCount,
      higherIsBetter: true,
    },
    {
      label: 'Hedef',
      format: fmtNum,
      leftValue: left.liveTarget,
      rightValue: right.liveTarget,
      higherIsBetter: true,
    },
    {
      label: 'Hedef Gerçekleşme',
      format: fmtPercent,
      leftValue: left.liveTarget > 0 ? (left.liveCount / left.liveTarget) * 100 : 0,
      rightValue: right.liveTarget > 0 ? (right.liveCount / right.liveTarget) * 100 : 0,
      higherIsBetter: true,
    },
  ]

  if (usesCsat) {
    rows.push({
      label: 'CSAT',
      format: (n) => `${n.toFixed(2)}/5`,
      leftValue: left.csatScore,
      rightValue: right.csatScore,
      higherIsBetter: true,
    })
  } else {
    rows.push({
      label: 'NPS',
      format: (n) => `${n.toFixed(2)}/5`,
      leftValue: left.npsScore,
      rightValue: right.npsScore,
      higherIsBetter: true,
    })
    rows.push({
      label: 'Toplantı',
      format: (n) => `${n.toFixed(2)}/5`,
      leftValue: left.meetingScore,
      rightValue: right.meetingScore,
      higherIsBetter: true,
    })
  }

  rows.push({
    label: 'Ort. Canlıya Alma Süresi',
    format: (n) => `${n.toFixed(1)} gün`,
    leftValue: left.avgGoLiveDurationDays,
    rightValue: right.avgGoLiveDurationDays,
    higherIsBetter: false,
  })

  return rows
}
