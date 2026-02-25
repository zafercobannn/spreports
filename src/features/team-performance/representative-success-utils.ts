import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'

export interface RepresentativeDerivedMetrics {
  livePercent: number
  auditPercent: number
  npsPercent: number
  meetingPercent: number
  weightedLive: number
  weightedAudit: number
  weightedNps: number
  weightedMeeting: number
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

export function calculateRepresentativeMetrics(
  record: RepresentativeSuccessRecord,
  weights: RepresentativeSuccessWeights,
): RepresentativeDerivedMetrics {
  const livePercent = record.liveTarget > 0 ? (record.liveCount / record.liveTarget) * 100 : 0
  const auditPercent = Math.max(0, Math.min(100, record.auditScore))
  const npsPercent = scorePercent(record.npsScore, 5)
  const meetingPercent = scorePercent(record.meetingScore, 5)

  const weightedLive = livePercent * (weights.liveCount / 100)
  const weightedAudit = auditPercent * (weights.auditScore / 100)
  const weightedNps = npsPercent * (weights.npsScore / 100)
  const weightedMeeting = meetingPercent * (weights.meetingScore / 100)

  return {
    livePercent,
    auditPercent,
    npsPercent,
    meetingPercent,
    weightedLive,
    weightedAudit,
    weightedNps,
    weightedMeeting,
    successIndex: weightedLive + weightedAudit + weightedNps + weightedMeeting,
  }
}

function detectDelimiter(line: string): ',' | ';' {
  const commaCount = (line.match(/,/g) ?? []).length
  const semicolonCount = (line.match(/;/g) ?? []).length
  return semicolonCount > commaCount ? ';' : ','
}

function parseCsvLine(line: string, delimiter: ',' | ';'): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
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

export function parseRepresentativeCsv(csvText: string): RepresentativeSuccessRecord[] {
  const lines = csvText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    throw new Error('CSV dosyasında başlık ve en az 1 veri satırı olmalı.')
  }

  const headerLine = lines[0].replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(headerLine)
  const headers = parseCsvLine(headerLine, delimiter)

  const nameIdx = resolveHeaderIndex(headers, ['temsilci', 'temsilciadi', 'mtadi'])
  const liveIdx = resolveHeaderIndex(headers, ['canliyaalinanhesapsayisi', 'canliyaalinanfirmaadedi'])
  const liveTargetIdx = resolveHeaderIndex(headers, ['canliyaalinanhesapsayisihedefi', 'canliyaalinanfirmaadedihedefi'])
  const auditIdx = resolveHeaderIndex(headers, ['auditpuani', 'auditskoru'])
  const npsIdx = resolveHeaderIndex(headers, ['npsanketskoru', 'onboardinganketskoru', 'npsscore'])
  const meetingIdx = resolveHeaderIndex(headers, ['toplantidegerlendirmesi'])
  const imageIdx = resolveHeaderIndex(headers, ['gorsel', 'gorselurl', 'image', 'imageurl', 'foto', 'fotourl'])

  if ([nameIdx, liveIdx, liveTargetIdx, auditIdx, npsIdx, meetingIdx].some((idx) => idx === -1)) {
    throw new Error('CSV başlıkları eksik. Gerekli alanlar: Temsilci, Canlıya Alınan Hesap Sayısı, Hedef, Audit, NPS, Toplantı.')
  }

  const records = lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line, delimiter)
    const name = cells[nameIdx] ?? ''
    return {
      id: buildRecordId(name, index),
      name,
      liveCount: Math.max(0, toNumber(cells[liveIdx] ?? '0')),
      liveTarget: Math.max(0, toNumber(cells[liveTargetIdx] ?? '0')),
      auditScore: Math.max(0, Math.min(100, toNumber(cells[auditIdx] ?? '0'))),
      npsScore: Math.max(0, Math.min(5, toNumber(cells[npsIdx] ?? '0'))),
      meetingScore: Math.max(0, Math.min(5, toNumber(cells[meetingIdx] ?? '0'))),
      imageUrl: imageIdx >= 0 ? (cells[imageIdx] ?? '') : '',
    }
  }).filter((record) => record.name.trim().length > 0)

  if (records.length === 0) {
    throw new Error('CSV içinde geçerli temsilci satırı bulunamadı.')
  }

  return records
}
