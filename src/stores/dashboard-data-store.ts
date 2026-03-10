import { create, type StoreApi } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { CohortMatrix } from '@/types/cohort'
import type { TopFirm } from '@/types/firms'
import type { TargetStatus } from '@/types/targets'
import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import { TURKISH_MONTHS } from '@/utils/date-utils'
import { calculateGpvChangePercent, calculateParsUsageRatePercent } from '@/utils/top-firm-metrics'
import {
  isCloudPersistenceEnabled,
  loadDashboardPeriodFromCloud,
  saveDashboardPeriodToCloud,
} from '@/services/firebase/dashboard-period-service'

const STORAGE_KEY = 'spreports-manual-dashboard-data-v1'
const CLOUD_SAVE_DEBOUNCE_MS = 1200
const LOCAL_TO_CLOUD_MIGRATION_FLAG = 'spreports-local-to-cloud-migration-v1'
const ROLLING_MONTH_WINDOW = 6

const periodSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()
const periodEnsureTasks = new Map<string, Promise<void>>()
const periodLocalVersions = new Map<string, number>()
const hydratedPeriodKeys = new Set<string>()
let localToCloudMigrationTask: Promise<void> | null = null

const DEFAULT_REPRESENTATIVE_WEIGHTS: RepresentativeSuccessWeights = {
  liveCount: 30,
  auditScore: 30,
  npsScore: 20,
  meetingScore: 20,
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizeIkasText(value: string): string {
  return value.replace(/\b[iIİı][kK][aA][sS]\b/g, 'ikas')
}

function normalizeIkasCasingDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return normalizeIkasText(value) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeIkasCasingDeep(item)) as T
  }
  if (isObjectLike(value)) {
    const normalized: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      normalized[key] = normalizeIkasCasingDeep(entry)
    }
    return normalized as T
  }
  return value
}

function normalizeMonth(month: number): number {
  if (month < 1) return 1
  if (month > 12) return 12
  return month
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parsePeriodKey(key: string): { year: number; month: number } | null {
  const match = key.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]),
  }
}

function normalizeLegacyStatus(status: unknown): TargetStatus {
  if (status === 'live' || status === 'not-live') return status
  if (status === 'pending' || status === 'lost') return 'not-live'
  return 'not-live'
}

function isCohortMatrix(value: unknown): value is CohortMatrix {
  if (!isObjectLike(value)) return false
  return Array.isArray(value.rows) && Array.isArray(value.months)
}

function normalizeTopFirm(firm: unknown, rank: number, seedFirm?: TopFirm): TopFirm {
  const base = seedFirm ?? {
    rank,
    name: '',
    gpv: 0,
    previousMonthGPV: 0,
    gpvChange: 0,
    shipmentSent: 0,
    ikasCargoValue: 0,
    usesPars: false,
    parsUsageRate: 0,
  }

  if (!isObjectLike(firm)) {
    return { ...base, rank }
  }

  const gpv = toNumber(firm.gpv, base.gpv)
  const previousMonthGPV = toNumber(firm.previousMonthGPV, base.previousMonthGPV)
  const shipmentSent = Math.max(0, toNumber(firm.shipmentSent, base.shipmentSent))

  const ikasCargoValue = (() => {
    const directValue = toNumber(firm.ikasCargoValue, Number.NaN)
    if (Number.isFinite(directValue)) return Math.max(0, directValue)

    const legacyRate = toNumber(firm.ikasCargoUsageRate, Number.NaN)
    if (Number.isFinite(legacyRate)) {
      if (legacyRate <= 0) return 0
      const shipmentSent = toNumber(firm.shipmentSent, base.shipmentSent)
      return Math.max(1, Math.round((shipmentSent * legacyRate) / 100))
    }

    return base.ikasCargoValue
  })()

  const parsUsageRate = calculateParsUsageRatePercent(shipmentSent, ikasCargoValue)
  const usesPars = (() => {
    if (typeof firm.usesPars === 'boolean') return firm.usesPars
    const legacyRate = toNumber(firm.parsUsageRate, Number.NaN)
    if (Number.isFinite(legacyRate)) return legacyRate > 0
    return base.usesPars
  })()
  const gpvChange = calculateGpvChangePercent(gpv, previousMonthGPV)

  return {
    rank,
    name: typeof firm.name === 'string' ? firm.name : base.name,
    gpv,
    previousMonthGPV,
    gpvChange,
    shipmentSent,
    ikasCargoValue,
    usesPars,
    parsUsageRate,
  }
}

function normalizeRepresentativeRecord(
  record: unknown,
  index: number,
  seed?: RepresentativeSuccessRecord,
): RepresentativeSuccessRecord {
  const base = seed ?? {
    id: `rep-${index + 1}`,
    name: '',
    liveCount: 0,
    liveTarget: 0,
    auditScore: 0,
    npsScore: 0,
    avgGoLiveDurationDays: 0,
    meetingScore: 0,
    imageUrl: '',
  }

  if (!isObjectLike(record)) {
    return base
  }

  return {
    id: typeof record.id === 'string' && record.id.trim() ? record.id : base.id,
    name: typeof record.name === 'string' ? record.name : base.name,
    liveCount: Math.max(0, toNumber(record.liveCount, base.liveCount)),
    liveTarget: Math.max(0, toNumber(record.liveTarget, base.liveTarget)),
    auditScore: Math.max(0, Math.min(100, toNumber(record.auditScore, base.auditScore))),
    npsScore: Math.max(0, Math.min(5, toNumber(record.npsScore, base.npsScore))),
    avgGoLiveDurationDays: Math.max(0, toNumber(record.avgGoLiveDurationDays, base.avgGoLiveDurationDays)),
    meetingScore: Math.max(0, Math.min(5, toNumber(record.meetingScore, base.meetingScore))),
    imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : base.imageUrl,
  }
}

function normalizeRepresentativeWeights(
  weights: unknown,
  seed: RepresentativeSuccessWeights,
): RepresentativeSuccessWeights {
  if (!isObjectLike(weights)) {
    return seed
  }

  return {
    liveCount: Math.max(0, toNumber(weights.liveCount, seed.liveCount)),
    auditScore: Math.max(0, toNumber(weights.auditScore, seed.auditScore)),
    npsScore: Math.max(0, toNumber(weights.npsScore, seed.npsScore)),
    meetingScore: Math.max(0, toNumber(weights.meetingScore, seed.meetingScore)),
  }
}

export function getPeriodKey(year: number, month: number): string {
  return `${year}-${String(normalizeMonth(month)).padStart(2, '0')}`
}

function normalizeYearMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  if (!Number.isFinite(year)) {
    return { year: new Date().getFullYear(), month: normalizeMonth(month) }
  }

  let normalizedYear = Math.round(year)
  let normalizedMonth = Math.round(month)

  while (normalizedMonth < 1) {
    normalizedYear -= 1
    normalizedMonth += 12
  }
  while (normalizedMonth > 12) {
    normalizedYear += 1
    normalizedMonth -= 12
  }

  return { year: normalizedYear, month: normalizeMonth(normalizedMonth) }
}

function getMonthYearLabel(year: number, month: number): string {
  const normalized = normalizeYearMonth(year, month)
  const date = new Date(Date.UTC(normalized.year, normalized.month - 1, 1))
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replaceAll('.', '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getMonthNameFromLabel(label: string): string | null {
  const normalizedLabel = normalizeLabel(label)
  return TURKISH_MONTHS.find((monthName) => {
    const normalizedMonth = normalizeLabel(monthName)
    const shortToken = normalizedMonth.slice(0, 3)
    return normalizedLabel.includes(normalizedMonth) || normalizedLabel.includes(shortToken)
  }) ?? null
}

function normalizeLabel(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9]/g, '')
}

export interface RollingPeriodWindowItem {
  key: string
  year: number
  month: number
  label: string
  monthName: string
}

export function buildRollingPeriodWindow(
  endYear: number,
  endMonth: number,
  size = ROLLING_MONTH_WINDOW,
): RollingPeriodWindowItem[] {
  const normalizedSize = Math.max(1, Math.round(size))
  const end = normalizeYearMonth(endYear, endMonth)

  return Array.from({ length: normalizedSize }, (_, idx) => {
    const offset = normalizedSize - idx - 1
    const resolved = normalizeYearMonth(end.year, end.month - offset)
    return {
      year: resolved.year,
      month: resolved.month,
      key: getPeriodKey(resolved.year, resolved.month),
      label: getMonthYearLabel(resolved.year, resolved.month),
      monthName: TURKISH_MONTHS[resolved.month - 1],
    }
  })
}

function normalizePlatformCounts(value: unknown): DashboardPeriodData['monthlyGPV']['previousPlatformsSP'] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!isObjectLike(item)) return null
      return {
        name: typeof item.name === 'string' ? item.name : '',
        count: Math.max(0, toNumber(item.count, 0)),
      }
    })
    .filter((item): item is DashboardPeriodData['monthlyGPV']['previousPlatformsSP'][number] => item !== null)
}

function calculateMonthlyLiveCount(liveSPCount: number, premiumOnboardingLiveCount: number): number {
  const safeLiveSp = Math.max(0, toNumber(liveSPCount, 0))
  const safePremium = Math.max(0, toNumber(premiumOnboardingLiveCount, 0))
  return safeLiveSp + safePremium
}

function normalizeCohortForMonth(
  cohort: CohortMatrix,
  year: number,
  month: number,
): CohortMatrix {
  const window = buildRollingPeriodWindow(year, month)
  const months = window.map((item) => item.label)
  const rowMapByLabel = new Map(
    cohort.rows.map((row) => [normalizeLabel(row.goLiveMonth), row] as const),
  )
  const rowMapByMonthName = new Map<string, CohortMatrix['rows'][number]>()

  cohort.rows.forEach((row) => {
    const monthName = getMonthNameFromLabel(row.goLiveMonth)
    if (!monthName || rowMapByMonthName.has(monthName)) return
    rowMapByMonthName.set(monthName, row)
  })

  const rows = window.map((slot) => {
    const sourceRow = rowMapByLabel.get(normalizeLabel(slot.label)) ?? rowMapByMonthName.get(slot.monthName)
    const sourceCellMapByLabel = new Map(
      (sourceRow?.cells ?? []).map((cell) => [normalizeLabel(cell.observedMonth), cell.gpvValue] as const),
    )
    const sourceCellMapByMonthName = new Map<string, number>()

    ;(sourceRow?.cells ?? []).forEach((cell) => {
      const monthName = getMonthNameFromLabel(cell.observedMonth)
      if (!monthName || sourceCellMapByMonthName.has(monthName)) return
      sourceCellMapByMonthName.set(monthName, cell.gpvValue)
    })

    return {
      goLiveMonth: slot.label,
      firmCount: toNumber(sourceRow?.firmCount, 0),
      cells: window.map((observedSlot) => ({
        goLiveMonth: slot.label,
        observedMonth: observedSlot.label,
        gpvValue: toNumber(
          sourceCellMapByLabel.get(normalizeLabel(observedSlot.label))
            ?? sourceCellMapByMonthName.get(observedSlot.monthName),
          0,
        ),
      })),
      topFirms: Array.isArray(sourceRow?.topFirms)
        ? sourceRow.topFirms.map((firm) => ({
            name: typeof firm.name === 'string' ? firm.name : '',
            gpv: toNumber(firm.gpv, 0),
          }))
        : [],
    }
  })

  return {
    months,
    rows,
  }
}

function createEmptyCohortForMonth(year: number, month: number): CohortMatrix {
  const normalizedMonth = normalizeMonth(month)
  const window = buildRollingPeriodWindow(year, normalizedMonth)
  const months = window.map((item) => item.label)

  return {
    months,
    rows: window.map((slot) => ({
      goLiveMonth: slot.label,
      firmCount: 0,
      cells: months.map((observedMonth) => ({
        goLiveMonth: slot.label,
        observedMonth,
        gpvValue: 0,
      })),
      topFirms: [
        { name: '', gpv: 0 },
        { name: '', gpv: 0 },
        { name: '', gpv: 0 },
      ],
    })),
  }
}

function createEmptyPeriodData(year: number, month: number): DashboardPeriodData {
  const normalizedMonth = normalizeMonth(month)
  const monthlyGPV: DashboardPeriodData['monthlyGPV'] = {
    month: normalizedMonth,
    year,
    ikasGPV: 0,
    spGPV: 0,
    gpvRatio: 0,
    liveAccountCount: 0,
    liveSPCount: 0,
    monthlyLiveCount: 0,
    totalSP: 0,
    premiumOnboardingLiveCount: 0,
    premiumOnboardingAvgGoLiveDurationDays: 0,
    scalePlusAvgGoLiveDurationDays: 0,
    previousPlatformsSP: [],
    previousPlatformsPremiumOnboarding: [],
  }

  const emptyData: DashboardPeriodData = {
    monthlyGPV: {
      ...monthlyGPV,
      monthlyLiveCount: calculateMonthlyLiveCount(monthlyGPV.liveSPCount, monthlyGPV.premiumOnboardingLiveCount),
    },
    cohort: createEmptyCohortForMonth(year, normalizedMonth),
    topFirms: [],
    targets: [],
    teamPerformance: [],
    representativeSuccess: [],
    representativeWeights: deepClone(DEFAULT_REPRESENTATIVE_WEIGHTS),
    monthlyTargets: [],
    successIndex: {
      overallScore: 0,
      metrics: [],
    },
  }

  return normalizeIkasCasingDeep(emptyData)
}

function sanitizePeriodData(year: number, month: number, raw: unknown): DashboardPeriodData {
  const seed = createEmptyPeriodData(year, month)
  const normalizedRaw = normalizeIkasCasingDeep(raw)
  if (!isObjectLike(normalizedRaw)) {
    return seed
  }
  const safeRaw = normalizedRaw

  const monthlyGPV = isObjectLike(safeRaw.monthlyGPV)
    ? {
        ...seed.monthlyGPV,
        ...safeRaw.monthlyGPV,
        year,
        month: normalizeMonth(month),
      }
    : seed.monthlyGPV

  const legacyPlatforms = normalizePlatformCounts(monthlyGPV.previousPlatforms)
  const normalizedSpPlatforms = normalizePlatformCounts(monthlyGPV.previousPlatformsSP)
  const normalizedPremiumPlatforms = normalizePlatformCounts(monthlyGPV.previousPlatformsPremiumOnboarding)
  const hasSpPlatformsSource = Array.isArray(monthlyGPV.previousPlatformsSP)
  const hasPremiumPlatformsSource = Array.isArray(monthlyGPV.previousPlatformsPremiumOnboarding)
  const legacyAvgGoLive = toNumber(monthlyGPV.avgGoLiveDurationDays, 0)
  const normalizedTotalSP = Math.max(0, toNumber(monthlyGPV.totalSP, seed.monthlyGPV.totalSP))
  const normalizedPremiumOnboardingLiveCount = Math.max(
    0,
    toNumber(monthlyGPV.premiumOnboardingLiveCount, seed.monthlyGPV.premiumOnboardingLiveCount),
  )
  const normalizedLiveSPCount = Math.max(0, toNumber(monthlyGPV.liveSPCount, seed.monthlyGPV.liveSPCount))
  const normalizedMonthlyLiveCount = calculateMonthlyLiveCount(
    normalizedLiveSPCount,
    normalizedPremiumOnboardingLiveCount,
  )

  const normalizedMonthlyGPV: DashboardPeriodData['monthlyGPV'] = {
    ...monthlyGPV,
    ikasGPV: Math.max(0, toNumber(monthlyGPV.ikasGPV, seed.monthlyGPV.ikasGPV)),
    spGPV: Math.max(0, toNumber(monthlyGPV.spGPV, seed.monthlyGPV.spGPV)),
    gpvRatio: Math.max(0, toNumber(monthlyGPV.gpvRatio, seed.monthlyGPV.gpvRatio)),
    liveAccountCount: Math.max(0, toNumber(monthlyGPV.liveAccountCount, seed.monthlyGPV.liveAccountCount)),
    totalSP: normalizedTotalSP,
    premiumOnboardingLiveCount: normalizedPremiumOnboardingLiveCount,
    monthlyLiveCount: normalizedMonthlyLiveCount,
    liveSPCount: normalizedLiveSPCount,
    premiumOnboardingAvgGoLiveDurationDays: Math.max(
      0,
      toNumber(monthlyGPV.premiumOnboardingAvgGoLiveDurationDays, legacyAvgGoLive),
    ),
    scalePlusAvgGoLiveDurationDays: Math.max(
      0,
      toNumber(monthlyGPV.scalePlusAvgGoLiveDurationDays, legacyAvgGoLive),
    ),
    previousPlatformsSP: hasSpPlatformsSource ? normalizedSpPlatforms : legacyPlatforms,
    previousPlatformsPremiumOnboarding: hasPremiumPlatformsSource
      ? normalizedPremiumPlatforms
      : legacyPlatforms,
  }

  const topFirms = Array.isArray(safeRaw.topFirms)
    ? safeRaw.topFirms.map((firm, idx) => normalizeTopFirm(firm, idx + 1, seed.topFirms[idx]))
    : seed.topFirms

  const targets = Array.isArray(safeRaw.targets)
    ? safeRaw.targets.map((target) => {
        if (!isObjectLike(target)) return null
        return {
          name: typeof target.name === 'string' ? target.name : '',
          sector: typeof target.sector === 'string' ? target.sector : '',
          estimatedRevenue: toNumber(target.estimatedRevenue, 0),
          status: normalizeLegacyStatus(target.status),
        }
      }).filter((target): target is DashboardPeriodData['targets'][number] => target !== null)
    : seed.targets

  const teamPerformance = Array.isArray(safeRaw.teamPerformance)
    ? safeRaw.teamPerformance.map((item, idx) => {
        if (!isObjectLike(item)) return seed.teamPerformance[idx] ?? null
        const member = isObjectLike(item.member) ? item.member : {}
        return {
          member: {
            id: typeof member.id === 'string' ? member.id : `sp-${idx + 1}`,
            name: typeof member.name === 'string' ? member.name : '',
            role: typeof member.role === 'string' ? member.role : undefined,
          },
          assignedCount: toNumber(item.assignedCount, 0),
          completedCount: toNumber(item.completedCount, 0),
          completionRate: toNumber(item.completionRate, 0),
          avgDurationDays: toNumber(item.avgDurationDays, 0),
          successScore: toNumber(item.successScore, 0),
        }
      }).filter((item): item is DashboardPeriodData['teamPerformance'][number] => item !== null)
    : seed.teamPerformance

  const representativeSuccess = Array.isArray(safeRaw.representativeSuccess)
    ? safeRaw.representativeSuccess.map((record, idx) =>
        normalizeRepresentativeRecord(record, idx, seed.representativeSuccess[idx]),
      )
    : seed.representativeSuccess

  const representativeWeights = normalizeRepresentativeWeights(
    safeRaw.representativeWeights,
    seed.representativeWeights,
  )

  const monthlyTargets = Array.isArray(safeRaw.monthlyTargets)
    ? safeRaw.monthlyTargets.map((target, idx) => {
        if (!isObjectLike(target)) return seed.monthlyTargets[idx] ?? null
        return {
          metricName: typeof target.metricName === 'string' ? target.metricName : '',
          targetValue: toNumber(target.targetValue, 0),
          actualValue: toNumber(target.actualValue, 0),
          unit: typeof target.unit === 'string' ? target.unit : '',
        }
      }).filter((target): target is DashboardPeriodData['monthlyTargets'][number] => target !== null)
    : seed.monthlyTargets

  const successIndex = isObjectLike(safeRaw.successIndex)
    ? {
        overallScore: toNumber(safeRaw.successIndex.overallScore, seed.successIndex.overallScore),
        metrics: Array.isArray(safeRaw.successIndex.metrics)
          ? safeRaw.successIndex.metrics.map((metric, idx) => {
              if (!isObjectLike(metric)) return seed.successIndex.metrics[idx] ?? null
              return {
                label: typeof metric.label === 'string' ? metric.label : '',
                value: toNumber(metric.value, 0),
                weight: toNumber(metric.weight, 0),
              }
            }).filter((metric): metric is DashboardPeriodData['successIndex']['metrics'][number] => metric !== null)
          : seed.successIndex.metrics,
      }
    : seed.successIndex

  return {
    monthlyGPV: normalizedMonthlyGPV,
    cohort: isCohortMatrix(safeRaw.cohort)
      ? normalizeCohortForMonth(safeRaw.cohort, year, month)
      : normalizeCohortForMonth(seed.cohort, year, month),
    topFirms,
    targets,
    teamPerformance,
    representativeSuccess,
    representativeWeights,
    monthlyTargets,
    successIndex,
  }
}

function ensurePeriodsMap(periods: unknown): Record<string, DashboardPeriodData> {
  if (!isObjectLike(periods)) return {}
  const sanitized: Record<string, DashboardPeriodData> = {}
  for (const [key, value] of Object.entries(periods)) {
    const parsedKey = parsePeriodKey(key)
    if (!parsedKey) continue
    sanitized[key] = sanitizePeriodData(parsedKey.year, parsedKey.month, value)
  }
  return sanitized
}

function createInitialPeriods(): Record<string, DashboardPeriodData> {
  return {}
}

function getLocalPeriodVersion(key: string): number {
  return periodLocalVersions.get(key) ?? 0
}

function ensureLocalPeriodVersion(key: string): void {
  if (!periodLocalVersions.has(key)) {
    periodLocalVersions.set(key, 0)
  }
}

function bumpLocalPeriodVersion(key: string): number {
  const nextVersion = getLocalPeriodVersion(key) + 1
  periodLocalVersions.set(key, nextVersion)
  return nextVersion
}

function clearPendingCloudSaves(): void {
  periodSaveTimers.forEach((timerId) => clearTimeout(timerId))
  periodSaveTimers.clear()
}

function schedulePeriodSaveToCloud(year: number, month: number, data: DashboardPeriodData): void {
  if (!isCloudPersistenceEnabled()) return

  const key = getPeriodKey(year, month)
  const prevTimer = periodSaveTimers.get(key)
  if (prevTimer) {
    clearTimeout(prevTimer)
  }

  const nextTimer = setTimeout(() => {
    periodSaveTimers.delete(key)
    void saveDashboardPeriodToCloud(year, month, data).catch((error) => {
      console.error('[dashboard-data-store] Bulut kaydı başarısız:', error)
    })
  }, CLOUD_SAVE_DEBOUNCE_MS)

  periodSaveTimers.set(key, nextTimer)
}

function safeStorageGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeStorageSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage erişimi engellenmiş olabilir.
  }
}

function safeStorageRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // localStorage erişimi engellenmiş olabilir.
  }
}

function migrateLocalPeriodsToCloudIfNeeded(
  get: StoreApi<DashboardDataStore>['getState'],
): Promise<void> {
  if (!isCloudPersistenceEnabled()) return Promise.resolve()

  const migrationDone = safeStorageGetItem(LOCAL_TO_CLOUD_MIGRATION_FLAG)
  if (migrationDone === 'done' || migrationDone === 'failed') return Promise.resolve()
  if (localToCloudMigrationTask) return localToCloudMigrationTask

  localToCloudMigrationTask = (async () => {
    const localPeriods = ensurePeriodsMap(get().periods)
    for (const [key, periodData] of Object.entries(localPeriods)) {
      const parsedKey = parsePeriodKey(key)
      if (!parsedKey) continue

      const cloudData = await loadDashboardPeriodFromCloud(parsedKey.year, parsedKey.month)
      if (cloudData) continue

      await saveDashboardPeriodToCloud(parsedKey.year, parsedKey.month, periodData)
      hydratedPeriodKeys.add(key)
    }

    safeStorageSetItem(LOCAL_TO_CLOUD_MIGRATION_FLAG, 'done')
  })()
    .catch((error) => {
      console.error('[dashboard-data-store] Local -> cloud migration başarısız:', error)
      safeStorageSetItem(LOCAL_TO_CLOUD_MIGRATION_FLAG, 'failed')
    })
    .finally(() => {
      localToCloudMigrationTask = null
    })

  return localToCloudMigrationTask
}

function ensurePeriodRemoteFirst(
  year: number,
  month: number,
  get: StoreApi<DashboardDataStore>['getState'],
  set: StoreApi<DashboardDataStore>['setState'],
): Promise<void> {
  const normalized = normalizeYearMonth(year, month)
  const key = getPeriodKey(normalized.year, normalized.month)

  const existingTask = periodEnsureTasks.get(key)
  if (existingTask) return existingTask

  ensureLocalPeriodVersion(key)
  const localVersionAtStart = getLocalPeriodVersion(key)

  const ensureTask = (async () => {
    if (isCloudPersistenceEnabled()) {
      await migrateLocalPeriodsToCloudIfNeeded(get)

      const cloudData = await loadDashboardPeriodFromCloud(normalized.year, normalized.month)
      if (cloudData && getLocalPeriodVersion(key) === localVersionAtStart) {
        set((state) => ({
          periods: {
            ...ensurePeriodsMap(state.periods),
            [key]: sanitizePeriodData(normalized.year, normalized.month, cloudData),
          },
        }))
        hydratedPeriodKeys.add(key)
        return
      }
    }

    const safePeriods = ensurePeriodsMap(get().periods)
    if (safePeriods[key]) {
      hydratedPeriodKeys.add(key)
      return
    }

    const fresh = createEmptyPeriodData(normalized.year, normalized.month)
    if (getLocalPeriodVersion(key) !== localVersionAtStart) return

    set((state) => ({
      periods: {
        ...ensurePeriodsMap(state.periods),
        [key]: fresh,
      },
    }))

    if (isCloudPersistenceEnabled()) {
      void saveDashboardPeriodToCloud(normalized.year, normalized.month, fresh).catch((error) => {
        console.error('[dashboard-data-store] Yeni dönem buluta yazılamadı:', error)
      })
    }
    hydratedPeriodKeys.add(key)
  })()
    .catch((error) => {
      console.error('[dashboard-data-store] Dönem remote-first yüklenemedi:', error)

      const safePeriods = ensurePeriodsMap(get().periods)
      if (safePeriods[key]) return

      const fallback = createEmptyPeriodData(normalized.year, normalized.month)
      set((state) => ({
        periods: {
          ...ensurePeriodsMap(state.periods),
          [key]: fallback,
        },
      }))
    })
    .finally(() => {
      periodEnsureTasks.delete(key)
    })

  periodEnsureTasks.set(key, ensureTask)
  return ensureTask
}

interface DashboardDataStore {
  periods: Record<string, DashboardPeriodData>
  ensurePeriod: (year: number, month: number) => void
  updatePeriodData: (
    year: number,
    month: number,
    updater: (data: DashboardPeriodData) => DashboardPeriodData
  ) => void
  replacePeriodData: (year: number, month: number, data: DashboardPeriodData) => void
  resetPeriod: (year: number, month: number) => void
  resetAll: () => void
}

export const useDashboardDataStore = create<DashboardDataStore>()(
  persist(
    (set, get) => ({
      periods: createInitialPeriods(),
      ensurePeriod: (year, month) => {
        void ensurePeriodRemoteFirst(year, month, get, set)
      },
      updatePeriodData: (year, month, updater) => {
        const key = getPeriodKey(year, month)
        ensureLocalPeriodVersion(key)
        bumpLocalPeriodVersion(key)
        set((state) => {
          const safePeriods = ensurePeriodsMap(state.periods)
          const current = safePeriods[key] ?? createEmptyPeriodData(year, month)
          const updated = sanitizePeriodData(year, month, updater(current))
          return {
            periods: {
              ...safePeriods,
              [key]: updated,
            },
          }
        })
        const latest = ensurePeriodsMap(get().periods)[key]
        if (latest) {
          schedulePeriodSaveToCloud(year, month, latest)
        }
      },
      replacePeriodData: (year, month, data) => {
        const key = getPeriodKey(year, month)
        ensureLocalPeriodVersion(key)
        bumpLocalPeriodVersion(key)
        const normalized = sanitizePeriodData(year, month, data)
        set((state) => ({
          periods: {
            ...ensurePeriodsMap(state.periods),
            [key]: normalized,
          },
        }))
        schedulePeriodSaveToCloud(year, month, normalized)
      },
      resetPeriod: (year, month) => {
        const key = getPeriodKey(year, month)
        ensureLocalPeriodVersion(key)
        bumpLocalPeriodVersion(key)
        const fresh = createEmptyPeriodData(year, month)
        set((state) => ({
          periods: {
            ...ensurePeriodsMap(state.periods),
            [key]: fresh,
          },
        }))
        schedulePeriodSaveToCloud(year, month, fresh)
      },
      resetAll: () => {
        clearPendingCloudSaves()
        periodEnsureTasks.clear()
        periodLocalVersions.clear()
        hydratedPeriodKeys.clear()
        localToCloudMigrationTask = null
        safeStorageRemoveItem(LOCAL_TO_CLOUD_MIGRATION_FLAG)
        set({ periods: createInitialPeriods() })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ periods: state.periods }),
      merge: (persistedState, currentState) => {
        const persisted = isObjectLike(persistedState) ? persistedState : {}
        const current = currentState as DashboardDataStore
        return {
          ...current,
          ...persisted,
          periods: ensurePeriodsMap(persisted.periods ?? current.periods),
        }
      },
    },
  ),
)
