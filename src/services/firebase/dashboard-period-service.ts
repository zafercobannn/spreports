import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  endAt,
  type QueryConstraint,
  where,
  writeBatch,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import {
  getFirebaseDb,
  getFirebaseStorageInstance,
  isFirebaseSyncEnabled,
  requireAdminFirebaseUser,
} from '@/lib/firebase/firebase-app'
import { decryptJsonAES256, encryptJsonAES256, isAes256Enabled } from '@/lib/security/aes-256'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { CohortMatrix } from '@/types/cohort'
import type { RepresentativeSuccessRecord } from '@/types/team'
import { calculateRepresentativeMetrics } from '@/features/team-performance/representative-success-utils'

const PERIOD_COLLECTION = 'dashboard_periods'
const REPRESENTATIVE_SUBCOLLECTION = 'representatives'
// v3: topFirms satırlarına `sector` alanı eklendi (eski dokümanlarda boş kabul edilir).
const PERIOD_SCHEMA_VERSION = 3

// Cohort tek kaynak (global) doküman: her dönemde tekrarlanan kopya yerine
// tüm go-live aylarının birikimli matrisi burada tutulur.
const COHORT_COLLECTION = 'dashboard_cohort'
const COHORT_DOC_ID = 'global'

interface EncryptedRepresentativePayload {
  id: string
  name: string
  liveCount: number
  liveTarget: number
  auditScore: number
  npsScore: number
  csatScore: number
  avgGoLiveDurationDays: number
  meetingScore: number
  imageUrl?: string
}

interface EncryptedPeriodPayload {
  monthlyGPV: DashboardPeriodData['monthlyGPV']
  cohort: DashboardPeriodData['cohort']
  topFirms: DashboardPeriodData['topFirms']
  targets: DashboardPeriodData['targets']
  targetCount: DashboardPeriodData['targetCount']
  realizedCount: DashboardPeriodData['realizedCount']
  teamPerformance: DashboardPeriodData['teamPerformance']
  monthlyTargets: DashboardPeriodData['monthlyTargets']
  successIndex: DashboardPeriodData['successIndex']
  representativeWeights: DashboardPeriodData['representativeWeights']
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, stripUndefinedDeep(entry)] as const)

    return Object.fromEntries(entries) as T
  }

  return value
}

export interface RepresentativeCloudSearchParams {
  year: number
  month: number
  search?: string
  minSuccessIndex?: number
  maxSuccessIndex?: number
  take?: number
}

function periodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function getPreviousPeriodKey(year: number, month: number): string {
  const previousMonth = month === 1 ? 12 : month - 1
  const previousYear = month === 1 ? year - 1 : year
  return periodKey(previousYear, previousMonth)
}

function normalizeName(value: string): string {
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

function getPeriodDocRef(year: number, month: number) {
  return doc(getFirebaseDb(), PERIOD_COLLECTION, periodKey(year, month))
}

function getRepresentativesRef(year: number, month: number) {
  return collection(getPeriodDocRef(year, month), REPRESENTATIVE_SUBCOLLECTION)
}

function parseRepresentativeFallback(data: Record<string, unknown>): RepresentativeSuccessRecord {
  return {
    id: String(data.id ?? ''),
    name: String(data.name ?? ''),
    liveCount: Number(data.liveCount ?? 0),
    liveTarget: Number(data.liveTarget ?? 0),
    auditScore: Number(data.auditScore ?? 0),
    npsScore: Number(data.npsScore ?? 0),
    csatScore: Number(data.csatScore ?? data.npsScore ?? 0),
    avgGoLiveDurationDays: Number(data.avgGoLiveDurationDays ?? 0),
    meetingScore: Number(data.meetingScore ?? 0),
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
  }
}

async function buildRepresentativeRecord(data: Record<string, unknown>): Promise<RepresentativeSuccessRecord> {
  if (typeof data.securePayload === 'string' && isAes256Enabled()) {
    try {
      return await decryptJsonAES256<EncryptedRepresentativePayload>(data.securePayload)
    } catch {
      return parseRepresentativeFallback(data)
    }
  }

  if (data.payload && typeof data.payload === 'object' && data.payload) {
    return parseRepresentativeFallback(data.payload as Record<string, unknown>)
  }

  return parseRepresentativeFallback(data)
}

export function isCloudPersistenceEnabled(): boolean {
  return isFirebaseSyncEnabled
}

export async function saveDashboardPeriodToCloud(
  year: number,
  month: number,
  data: DashboardPeriodData,
): Promise<void> {
  if (!isCloudPersistenceEnabled()) return
  requireAdminFirebaseUser()

  const periodRef = getPeriodDocRef(year, month)
  const repsRef = getRepresentativesRef(year, month)
  const existingPeriodSnapshot = await getDoc(periodRef)
  const periodDataPayload = stripUndefinedDeep<EncryptedPeriodPayload>({
    monthlyGPV: data.monthlyGPV,
    cohort: data.cohort,
    topFirms: data.topFirms,
    targets: data.targets,
    targetCount: data.targetCount,
    realizedCount: data.realizedCount,
    teamPerformance: data.teamPerformance,
    monthlyTargets: data.monthlyTargets,
    successIndex: data.successIndex,
    representativeWeights: data.representativeWeights,
  })

  const encryptedPeriodPayload = isAes256Enabled()
    ? await encryptJsonAES256(periodDataPayload)
    : null

  const periodDocPayload = {
    periodKey: periodKey(year, month),
    year,
    month,
    previousPeriodKey: getPreviousPeriodKey(year, month),
    schemaVersion: PERIOD_SCHEMA_VERSION,
    representativeCount: data.representativeSuccess.length,
    usesEncryption: Boolean(encryptedPeriodPayload),
    ...(encryptedPeriodPayload
      ? {
          payload: deleteField(),
          securePayload: encryptedPeriodPayload,
        }
      : {
          payload: periodDataPayload,
          securePayload: deleteField(),
        }),
    createdAt: existingPeriodSnapshot.exists()
      ? (existingPeriodSnapshot.data().createdAt ?? serverTimestamp())
      : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(
    periodRef,
    periodDocPayload,
    { merge: true },
  )

  const existingRepsSnapshot = await getDocs(repsRef)
  const existingIds = new Set(existingRepsSnapshot.docs.map((item) => item.id))

  const batch = writeBatch(getFirebaseDb())

  for (const rep of data.representativeSuccess) {
    const repRef = doc(repsRef, rep.id)
    existingIds.delete(rep.id)

    const metrics = calculateRepresentativeMetrics(rep, data.representativeWeights, year, month)
    const repPayload = stripUndefinedDeep<RepresentativeSuccessRecord>({
      id: rep.id,
      name: rep.name,
      liveCount: rep.liveCount,
      liveTarget: rep.liveTarget,
      auditScore: rep.auditScore,
      npsScore: rep.npsScore,
      csatScore: rep.csatScore,
      avgGoLiveDurationDays: rep.avgGoLiveDurationDays,
      meetingScore: rep.meetingScore,
      imageUrl: rep.imageUrl ?? '',
    })
    const encryptedRepPayload = isAes256Enabled()
      ? await encryptJsonAES256<EncryptedRepresentativePayload>(repPayload)
      : null

    batch.set(
      repRef,
      {
        id: rep.id,
        periodKey: periodKey(year, month),
        normalizedName: normalizeName(rep.name),
        successIndex: Number(metrics.successIndex.toFixed(3)),
        ...(encryptedRepPayload
          ? {
              payload: deleteField(),
              securePayload: encryptedRepPayload,
            }
          : {
              payload: repPayload,
              securePayload: deleteField(),
            }),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  for (const staleId of existingIds) {
    batch.delete(doc(repsRef, staleId))
  }

  await batch.commit()
}

export async function loadDashboardPeriodFromCloud(
  year: number,
  month: number,
): Promise<DashboardPeriodData | null> {
  if (!isCloudPersistenceEnabled()) return null

  const periodRef = getPeriodDocRef(year, month)
  const periodSnapshot = await getDoc(periodRef)
  if (!periodSnapshot.exists()) return null

  const periodDocData = periodSnapshot.data() as Record<string, unknown>
  let payload: EncryptedPeriodPayload | null = null

  if (typeof periodDocData.securePayload === 'string' && isAes256Enabled()) {
    try {
      payload = await decryptJsonAES256<EncryptedPeriodPayload>(periodDocData.securePayload)
    } catch {
      payload = null
    }
  }

  if (!payload && periodDocData.payload && typeof periodDocData.payload === 'object') {
    payload = periodDocData.payload as EncryptedPeriodPayload
  }

  if (!payload) return null

  const repsSnapshot = await getDocs(query(getRepresentativesRef(year, month), orderBy('successIndex', 'desc')))
  const representativeSuccess = await Promise.all(
    repsSnapshot.docs.map(async (item) => buildRepresentativeRecord(item.data() as Record<string, unknown>)),
  )

  return {
    monthlyGPV: payload.monthlyGPV,
    cohort: payload.cohort,
    topFirms: payload.topFirms,
    targets: payload.targets,
    targetCount: payload.targetCount ?? 0,
    realizedCount: payload.realizedCount ?? null,
    teamPerformance: payload.teamPerformance,
    monthlyTargets: payload.monthlyTargets,
    successIndex: payload.successIndex,
    representativeWeights: payload.representativeWeights,
    representativeSuccess,
  }
}

function isCohortMatrixShape(value: unknown): value is CohortMatrix {
  return Boolean(value)
    && typeof value === 'object'
    && Array.isArray((value as CohortMatrix).rows)
    && Array.isArray((value as CohortMatrix).months)
}

/** Global cohort dokümanını okur; yoksa null döner. */
export async function loadGlobalCohortFromCloud(): Promise<CohortMatrix | null> {
  if (!isCloudPersistenceEnabled()) return null

  const ref = doc(getFirebaseDb(), COHORT_COLLECTION, COHORT_DOC_ID)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null

  const data = snapshot.data() as Record<string, unknown>
  const cohort = data.cohort
  return isCohortMatrixShape(cohort) ? cohort : null
}

/** Global cohort dokümanını yazar (tek kaynak). */
export async function saveGlobalCohortToCloud(cohort: CohortMatrix): Promise<void> {
  if (!isCloudPersistenceEnabled()) return
  requireAdminFirebaseUser()

  const ref = doc(getFirebaseDb(), COHORT_COLLECTION, COHORT_DOC_ID)
  await setDoc(
    ref,
    {
      cohort: stripUndefinedDeep(cohort),
      schemaVersion: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/**
 * Tüm dönem dokümanlarındaki cohort kopyalarını, güncellenme zamanına göre
 * (en eski -> en yeni) sıralı döner. Global cohort'u ilk kez inşa ederken
 * (migration) kullanılır.
 */
export async function loadAllPeriodCohortsOrdered(): Promise<
  { periodKey: string; updatedMs: number; cohort: CohortMatrix | null }[]
> {
  if (!isCloudPersistenceEnabled()) return []

  const snapshot = await getDocs(collection(getFirebaseDb(), PERIOD_COLLECTION))
  const results: { periodKey: string; updatedMs: number; cohort: CohortMatrix | null }[] = []

  for (const docSnapshot of snapshot.docs) {
    if (!/^\d{4}-\d{2}$/.test(docSnapshot.id)) continue
    const data = docSnapshot.data() as Record<string, unknown>

    let cohort: CohortMatrix | null = null
    if (typeof data.securePayload === 'string' && isAes256Enabled()) {
      try {
        const decrypted = await decryptJsonAES256<EncryptedPeriodPayload>(data.securePayload)
        cohort = isCohortMatrixShape(decrypted?.cohort) ? decrypted.cohort : null
      } catch {
        cohort = null
      }
    } else if (data.payload && typeof data.payload === 'object') {
      const payloadCohort = (data.payload as Record<string, unknown>).cohort
      cohort = isCohortMatrixShape(payloadCohort) ? payloadCohort : null
    }

    const updatedAt = data.updatedAt as { toMillis?: () => number } | undefined
    const updatedMs = typeof updatedAt?.toMillis === 'function' ? updatedAt.toMillis() : 0

    results.push({ periodKey: docSnapshot.id, updatedMs, cohort })
  }

  results.sort((a, b) => a.updatedMs - b.updatedMs)
  return results
}

export async function searchRepresentativesInCloud({
  year,
  month,
  search,
  minSuccessIndex,
  maxSuccessIndex,
  take = 25,
}: RepresentativeCloudSearchParams): Promise<RepresentativeSuccessRecord[]> {
  if (!isCloudPersistenceEnabled()) return []

  const repsRef = getRepresentativesRef(year, month)
  const normalizedSearch = search ? normalizeName(search) : ''
  const safeTake = Math.max(1, Math.min(100, take))
  const hasSuccessFilter = minSuccessIndex !== undefined || maxSuccessIndex !== undefined

  const repsQuery = normalizedSearch
    ? query(
        repsRef,
        orderBy('normalizedName'),
        startAt(normalizedSearch),
        endAt(`${normalizedSearch}\uf8ff`),
        limit(safeTake),
      )
    : (() => {
      const constraints: QueryConstraint[] = []
      if (minSuccessIndex !== undefined) {
        constraints.push(where('successIndex', '>=', minSuccessIndex))
      }
      if (maxSuccessIndex !== undefined) {
        constraints.push(where('successIndex', '<=', maxSuccessIndex))
      }
      constraints.push(orderBy('successIndex', 'desc'))
      constraints.push(limit(safeTake))
      return query(repsRef, ...constraints)
    })()

  const snapshot = await getDocs(repsQuery)
  const rows = await Promise.all(
    snapshot.docs.map(async (item) => {
      const source = item.data() as Record<string, unknown>
      return {
        record: await buildRepresentativeRecord(source),
        successIndex: Number(source.successIndex ?? 0),
      }
    }),
  )

  if (!hasSuccessFilter && normalizedSearch) {
    return rows.map((row) => row.record)
  }

  return rows
    .filter((row) => {
      if (normalizedSearch) {
        const key = normalizeName(row.record.name)
        if (!key.startsWith(normalizedSearch)) return false
      }
      if (minSuccessIndex !== undefined && row.successIndex < minSuccessIndex) return false
      if (maxSuccessIndex !== undefined && row.successIndex > maxSuccessIndex) return false
      return true
    })
    .map((row) => row.record)
}

export async function uploadRepresentativeImageToCloud(
  year: number,
  month: number,
  representativeId: string,
  file: File,
): Promise<string> {
  if (!isCloudPersistenceEnabled()) {
    throw new Error('Firebase aktif değil. Görsel buluta yüklenemedi.')
  }
  requireAdminFirebaseUser()

  const extension = (() => {
    if (file.type.includes('png')) return 'png'
    if (file.type.includes('webp')) return 'webp'
    if (file.type.includes('jpeg') || file.type.includes('jpg')) return 'jpg'
    const fromName = file.name.split('.').pop()
    return fromName || 'jpg'
  })()

  const filePath = `representative-images/${representativeId}/${periodKey(year, month)}.${extension}`
  const fileRef = ref(getFirebaseStorageInstance(), filePath)
  await uploadBytes(fileRef, file, { contentType: file.type || 'image/jpeg' })
  return getDownloadURL(fileRef)
}

export async function deleteRepresentativeImageFromCloud(imageUrl: string): Promise<void> {
  if (!isCloudPersistenceEnabled()) return
  if (!imageUrl) return
  requireAdminFirebaseUser()

  try {
    const fileRef = ref(getFirebaseStorageInstance(), imageUrl)
    await deleteObject(fileRef)
  } catch {
    // Sessiz geçilir: görsel daha önce silinmiş olabilir.
  }
}
