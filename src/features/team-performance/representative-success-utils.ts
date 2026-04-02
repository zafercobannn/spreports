import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'

export const CSAT_EFFECTIVE_YEAR = 2026
export const CSAT_EFFECTIVE_MONTH = 3

export interface RepresentativeDerivedMetrics {
  mode: 'legacy' | 'csat'
  livePercent: number
  auditPercent: number
  npsPercent: number
  meetingPercent: number
  csatPercent: number
  weightedLive: number
  weightedAudit: number
  weightedNps: number
  weightedMeeting: number
  weightedCsat: number
  successIndex: number
}

function toNumber(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const parsed = Number(value.replace(',', '.').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeForKey(value: string): string {
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

function scorePercent(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, (value / max) * 100)
}

export function isRepresentativeCsatPeriod(year: number, month: number): boolean {
  return year > CSAT_EFFECTIVE_YEAR || (year === CSAT_EFFECTIVE_YEAR && month >= CSAT_EFFECTIVE_MONTH)
}

export function getDefaultRepresentativeWeights(year: number, month: number): RepresentativeSuccessWeights {
  if (isRepresentativeCsatPeriod(year, month)) {
    return {
      liveCount: 30,
      auditScore: 30,
      npsScore: 0,
      meetingScore: 0,
      csatScore: 40,
    }
  }

  return {
    liveCount: 30,
    auditScore: 30,
    npsScore: 20,
    meetingScore: 20,
    csatScore: 0,
  }
}

export function calculateRepresentativeMetrics(
  record: RepresentativeSuccessRecord,
  weights: RepresentativeSuccessWeights,
  year: number,
  month: number,
): RepresentativeDerivedMetrics {
  const usesCsatModel = isRepresentativeCsatPeriod(year, month)
  const livePercent = record.liveTarget > 0 ? (record.liveCount / record.liveTarget) * 100 : 0
  const auditPercent = Math.max(0, Math.min(100, record.auditScore))
  const npsPercent = scorePercent(record.npsScore, 5)
  const meetingPercent = scorePercent(record.meetingScore, 5)
  const csatPercent = scorePercent(record.csatScore, 5)

  const weightedLive = livePercent * (weights.liveCount / 100)
  const weightedAudit = auditPercent * (weights.auditScore / 100)
  const weightedNps = npsPercent * (weights.npsScore / 100)
  const weightedMeeting = meetingPercent * (weights.meetingScore / 100)
  const weightedCsat = csatPercent * (weights.csatScore / 100)

  return {
    mode: usesCsatModel ? 'csat' : 'legacy',
    livePercent,
    auditPercent,
    npsPercent,
    meetingPercent,
    csatPercent,
    weightedLive,
    weightedAudit,
    weightedNps,
    weightedMeeting,
    weightedCsat,
    successIndex: usesCsatModel
      ? weightedLive + weightedAudit + weightedCsat
      : weightedLive + weightedAudit + weightedNps + weightedMeeting,
  }
}

function detectDelimiter(line: string): ',' | ';' {
  const commaCount = (line.match(/,/g) ?? []).length
  const semicolonCount = (line.match(/;/g) ?? []).length
  return semicolonCount > commaCount ? ';' : ','
}

function parseCsvRows(text: string, delimiter: ',' | ';'): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      row.push(current.trim())
      current = ''
      continue
    }

    if (char === '\n' && !inQuotes) {
      row.push(current.trim())
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row)
      }
      row = []
      current = ''
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim())
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row)
    }
  }

  return rows
}

function resolveHeaderIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map((header) => normalizeForKey(header))
  return normalized.findIndex((header) => candidates.includes(header))
}

function buildRecordId(name: string, index: number): string {
  const slug = name
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return `${slug || 'rep'}-${index + 1}`
}

export function parseRepresentativeCsv(
  csvText: string,
  options?: { year: number; month: number },
): RepresentativeSuccessRecord[] {
  const normalizedText = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^\uFEFF/, '')

  const headerLine = normalizedText
    .split('\n')
    .find((line) => line.trim().length > 0)
  if (!headerLine) {
    throw new Error('CSV dosyasında başlık ve en az 1 veri satırı olmalı.')
  }

  const delimiter = detectDelimiter(headerLine)
  const rows = parseCsvRows(normalizedText, delimiter)
  if (rows.length < 2) {
    throw new Error('CSV dosyasında başlık ve en az 1 veri satırı olmalı.')
  }

  const headers = rows[0]
  const usesCsatModel = options ? isRepresentativeCsatPeriod(options.year, options.month) : false

  const nameIdx = resolveHeaderIndex(headers, ['temsilci', 'temsilciadi', 'mtadi'])
  const liveIdx = resolveHeaderIndex(headers, ['canliyaalinanhesapsayisi', 'canliyaalinanfirmaadedi'])
  const liveTargetIdx = resolveHeaderIndex(headers, ['canliyaalinanhesapsayisihedefi', 'canliyaalinanfirmaadedihedefi'])
  const auditIdx = resolveHeaderIndex(headers, ['auditpuani', 'auditpuan', 'auditskoru'])
  const npsIdx = resolveHeaderIndex(headers, ['npsanketskoru', 'onboardinganketskoru', 'npsscore'])
  const csatIdx = resolveHeaderIndex(headers, [
    'csat',
    'csatskoru',
    'csatanketskoru',
    'musterimemnuniyetiskoru',
    'csatcalltoplantidegerlendirmesimail',
    'csatcalltoplantidegerlendirmesimailpuani',
    'npsanketskoru',
    'onboardinganketskoru',
    'npsscore',
  ])
  const avgGoLiveDurationIdx = resolveHeaderIndex(headers, [
    'ortalamacanliyaalmasuresi',
    'ortalamacanliyaalmasuresigun',
    'avggolivedurationdays',
    'canliyaalmasuresi',
  ])
  const meetingIdx = resolveHeaderIndex(headers, ['toplantidegerlendirmesi'])
  const imageIdx = resolveHeaderIndex(headers, ['gorsel', 'gorselurl', 'image', 'imageurl', 'foto', 'fotourl'])

  if (usesCsatModel) {
    if ([nameIdx, liveIdx, liveTargetIdx, auditIdx, csatIdx].some((idx) => idx === -1)) {
      throw new Error('CSV başlıkları eksik. Gerekli alanlar: Temsilci, Canlıya Alınan Hesap Sayısı, Canlıya Alınan Hesap Sayısı Hedefi, Audit Puan, CSAT.')
    }
  } else if ([nameIdx, liveIdx, liveTargetIdx, auditIdx, npsIdx, meetingIdx].some((idx) => idx === -1)) {
    throw new Error('CSV başlıkları eksik. Gerekli alanlar: Temsilci, Canlıya Alınan Hesap Sayısı, Hedef, Audit, NPS, Toplantı.')
  }

  const records = rows.slice(1).map((cells, index) => {
    const name = cells[nameIdx] ?? ''
    return {
      id: buildRecordId(name, index),
      name,
      liveCount: Math.max(0, toNumber(cells[liveIdx] ?? '0')),
      liveTarget: Math.max(0, toNumber(cells[liveTargetIdx] ?? '0')),
      auditScore: Math.max(0, Math.min(100, toNumber(cells[auditIdx] ?? '0'))),
      npsScore: usesCsatModel ? 0 : Math.max(0, Math.min(5, toNumber(cells[npsIdx] ?? '0'))),
      csatScore: usesCsatModel ? Math.max(0, Math.min(5, toNumber(cells[csatIdx] ?? '0'))) : 0,
      avgGoLiveDurationDays: Math.max(0, toNumber(avgGoLiveDurationIdx >= 0 ? (cells[avgGoLiveDurationIdx] ?? '0') : '0')),
      meetingScore: usesCsatModel ? 0 : Math.max(0, Math.min(5, toNumber(cells[meetingIdx] ?? '0'))),
      imageUrl: imageIdx >= 0 ? (cells[imageIdx] ?? '') : '',
    }
  }).filter((record) => record.name.trim().length > 0)

  if (records.length === 0) {
    throw new Error('CSV içinde geçerli temsilci satırı bulunamadı.')
  }

  return records
}
