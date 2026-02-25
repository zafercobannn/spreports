import { create, type StoreApi } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  MOCK_COHORT,
  MOCK_MONTHLY_GPV,
  MOCK_MONTHLY_TARGETS,
  MOCK_REPRESENTATIVE_SUCCESS,
  MOCK_REPRESENTATIVE_SUCCESS_WEIGHTS,
  MOCK_SUCCESS_INDEX,
  MOCK_TARGETS,
  MOCK_TEAM_PERFORMANCE,
  MOCK_TOP_FIRMS,
} from '@/services/mock-data'
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

const periodSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()
const periodHydrationTasks = new Map<string, Promise<void>>()
const periodLocalVersions = new Map<string, number>()
const hydratedPeriodKeys = new Set<string>()

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
  if (status === 'live' || status === 'pending' || status === 'lost') return status
  return 'pending'
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
  const gpvChange = calculateGpvChangePercent(gpv, previousMonthGPV)

  return {
    rank,
    name: typeof firm.name === 'string' ? firm.name : base.name,
    gpv,
    previousMonthGPV,
    gpvChange,
    shipmentSent,
    ikasCargoValue,
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

function buildRollingMonthNames(endMonth: number, count: number): string[] {
  const normalizedCount = Math.max(2, Math.min(12, count))
  const normalizedEndMonth = normalizeMonth(endMonth)
  return Array.from({ length: normalizedCount }, (_, idx) => {
    const offset = normalizedCount - idx - 1
    const monthIndex = (normalizedEndMonth - 1 - offset + 12) % 12
    return TURKISH_MONTHS[monthIndex]
  })
}

function normalizeCohortForMonth(cohort: CohortMatrix, month: number): CohortMatrix {
  const monthCount = Math.max(6, Math.min(12, cohort.months.length || 6))
  const months = buildRollingMonthNames(month, monthCount)
  const rowMap = new Map(cohort.rows.map((row) => [row.goLiveMonth, row]))

  const rows = months.map((goLiveMonth) => {
    const sourceRow = rowMap.get(goLiveMonth)
    const sourceCellMap = new Map(
      (sourceRow?.cells ?? []).map((cell) => [cell.observedMonth, cell.gpvValue] as const),
    )

    return {
      goLiveMonth,
      firmCount: toNumber(sourceRow?.firmCount, 0),
      cells: months.map((observedMonth) => ({
        goLiveMonth,
        observedMonth,
        gpvValue: toNumber(sourceCellMap.get(observedMonth), 0),
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

function createSeedPeriodData(year: number, month: number): DashboardPeriodData {
  const normalizedMonth = normalizeMonth(month)
  const topFirms = deepClone(MOCK_TOP_FIRMS).map((firm, idx) => ({
    ...firm,
    rank: idx + 1,
    gpvChange: calculateGpvChangePercent(firm.gpv, firm.previousMonthGPV),
    parsUsageRate: calculateParsUsageRatePercent(firm.shipmentSent, firm.ikasCargoValue),
  }))

  const seedData: DashboardPeriodData = {
    monthlyGPV: {
      ...deepClone(MOCK_MONTHLY_GPV),
      year,
      month: normalizedMonth,
    },
    cohort: normalizeCohortForMonth(deepClone(MOCK_COHORT), normalizedMonth),
    topFirms,
    targets: deepClone(MOCK_TARGETS),
    teamPerformance: deepClone(MOCK_TEAM_PERFORMANCE),
    representativeSuccess: deepClone(MOCK_REPRESENTATIVE_SUCCESS),
    representativeWeights: deepClone(MOCK_REPRESENTATIVE_SUCCESS_WEIGHTS),
    monthlyTargets: deepClone(MOCK_MONTHLY_TARGETS),
    successIndex: deepClone(MOCK_SUCCESS_INDEX),
  }

  return normalizeIkasCasingDeep(seedData)
}

function sanitizePeriodData(year: number, month: number, raw: unknown): DashboardPeriodData {
  const seed = createSeedPeriodData(year, month)
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
    monthlyGPV,
    cohort: isCohortMatrix(safeRaw.cohort)
      ? normalizeCohortForMonth(safeRaw.cohort, month)
      : normalizeCohortForMonth(seed.cohort, month),
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

const seedKey = getPeriodKey(MOCK_MONTHLY_GPV.year, MOCK_MONTHLY_GPV.month)
periodLocalVersions.set(seedKey, 0)
function createInitialPeriods(): Record<string, DashboardPeriodData> {
  return {
    [seedKey]: createSeedPeriodData(MOCK_MONTHLY_GPV.year, MOCK_MONTHLY_GPV.month),
  }
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

function hydratePeriodFromCloud(
  year: number,
  month: number,
  set: StoreApi<DashboardDataStore>['setState'],
): Promise<void> {
  if (!isCloudPersistenceEnabled()) {
    return Promise.resolve()
  }

  const key = getPeriodKey(year, month)
  if (hydratedPeriodKeys.has(key)) {
    return Promise.resolve()
  }
  const existingTask = periodHydrationTasks.get(key)
  if (existingTask) return existingTask

  const localVersionAtStart = getLocalPeriodVersion(key)

  const hydrationTask = (async () => {
    const cloudData = await loadDashboardPeriodFromCloud(year, month)
    if (!cloudData) {
      hydratedPeriodKeys.add(key)
      return
    }
    if (getLocalPeriodVersion(key) !== localVersionAtStart) return

    set((state: DashboardDataStore) => {
      const safePeriods = ensurePeriodsMap(state.periods)
      if (!safePeriods[key]) {
        return state
      }
      return {
        periods: {
          ...safePeriods,
          [key]: sanitizePeriodData(year, month, cloudData),
        },
      }
    })
    hydratedPeriodKeys.add(key)
  })()
    .catch((error) => {
      console.error('[dashboard-data-store] Bulut verisi yüklenemedi:', error)
    })
    .finally(() => {
      periodHydrationTasks.delete(key)
    })

  periodHydrationTasks.set(key, hydrationTask)
  return hydrationTask
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
        const key = getPeriodKey(year, month)
        ensureLocalPeriodVersion(key)
        const safePeriods = ensurePeriodsMap(get().periods)
        const exists = Boolean(safePeriods[key])
        if (!exists) {
          const fresh = createSeedPeriodData(year, month)
          set((state) => ({
            periods: {
              ...ensurePeriodsMap(state.periods),
              [key]: fresh,
            },
          }))
        }

        void hydratePeriodFromCloud(year, month, set)
      },
      updatePeriodData: (year, month, updater) => {
        const key = getPeriodKey(year, month)
        ensureLocalPeriodVersion(key)
        bumpLocalPeriodVersion(key)
        set((state) => {
          const safePeriods = ensurePeriodsMap(state.periods)
          const current = safePeriods[key] ?? createSeedPeriodData(year, month)
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
        const fresh = createSeedPeriodData(year, month)
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
        periodHydrationTasks.clear()
        periodLocalVersions.clear()
        hydratedPeriodKeys.clear()
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
