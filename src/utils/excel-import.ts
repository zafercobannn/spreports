import * as XLSX from 'xlsx'
import type { PlatformCount } from '@/types/gpv'
import type { TopFirm } from '@/types/firms'
import { calculateGpvChangePercent } from '@/utils/top-firm-metrics'

type RowRecord = Record<string, unknown>

function detectDelimiter(line: string): ',' | ';' {
  const commaCount = (line.match(/,/g) ?? []).length
  const semicolonCount = (line.match(/;/g) ?? []).length
  return semicolonCount > commaCount ? ';' : ','
}

function parseDelimitedLine(line: string, delimiter: ',' | ';'): string[] {
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

function normalizeKey(value: string): string {
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

function normalizeText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return 0

    if (trimmed.includes(',') && trimmed.includes('.')) {
      const normalized = trimmed.replace(/\./g, '').replace(',', '.')
      const parsed = Number(normalized)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (trimmed.includes(',')) {
      const parsed = Number(trimmed.replace(',', '.'))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const dotCount = (trimmed.match(/\./g) ?? []).length
    if (dotCount > 1) {
      const parsed = Number(trimmed.replace(/\./g, ''))
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (dotCount === 1 && /^\d{1,3}\.\d{3}$/.test(trimmed)) {
      const parsed = Number(trimmed.replace('.', ''))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function getCell(row: RowRecord, keys: string[]): unknown {
  const map = new Map(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  )
  for (const key of keys) {
    if (map.has(key)) return map.get(key)
  }
  return undefined
}

function hasAnyHeader(rows: RowRecord[], keys: string[]): boolean {
  if (rows.length === 0) return false
  const normalizedHeaders = Object.keys(rows[0]).map((header) => normalizeKey(header))
  return keys.some((key) => normalizedHeaders.includes(key))
}

function parseUsageStatus(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0

  const normalized = normalizeKey(String(value ?? ''))
  if (!normalized) return false

  return [
    'kullaniyor',
    'evet',
    'yes',
    'true',
    '1',
    'aktif',
    'var',
  ].some((token) => normalized.includes(token))
}

export async function readExcelRows(file: File): Promise<RowRecord[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.SheetNames[0]
  if (!firstSheet) {
    throw new Error('Dosyada sayfa bulunamadı.')
  }

  const rows = XLSX.utils.sheet_to_json<RowRecord>(workbook.Sheets[firstSheet], {
    defval: '',
    raw: true,
  })

  if (rows.length === 0) {
    throw new Error('Dosyada veri bulunamadı.')
  }

  return rows
}

async function readCsvRows(file: File): Promise<RowRecord[]> {
  const text = await file.text()
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    throw new Error('CSV dosyasında başlık ve en az 1 veri satırı olmalı.')
  }

  const headerLine = lines[0].replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(headerLine)
  const headers = parseDelimitedLine(headerLine, delimiter)
    .map((header) => normalizeText(header))
    .filter(Boolean)

  if (headers.length === 0) {
    throw new Error('CSV başlık satırı okunamadı.')
  }

  const rows = lines
    .slice(1)
    .map((line) => {
      const values = parseDelimitedLine(line, delimiter)
      const row: RowRecord = {}

      headers.forEach((header, index) => {
        row[header] = values[index] ?? ''
      })

      return row
    })
    .filter((row) => Object.values(row).some((value) => normalizeText(value).length > 0))

  if (rows.length === 0) {
    throw new Error('CSV dosyasında veri bulunamadı.')
  }

  return rows
}

function isCsvFile(file: File): boolean {
  const normalizedName = file.name.trim().toLocaleLowerCase('en-US')
  return normalizedName.endsWith('.csv') || file.type.toLocaleLowerCase('en-US').includes('csv')
}

export async function readSpreadsheetRows(file: File): Promise<RowRecord[]> {
  return isCsvFile(file) ? readCsvRows(file) : readExcelRows(file)
}

export function parsePlatformExcelRows(rows: RowRecord[]): PlatformCount[] {
  const hasPlatformHeader = hasAnyHeader(rows, ['altyapi', 'platform', 'platformadi', 'altyapiadi'])
  const hasCountHeader = hasAnyHeader(rows, ['adet', 'sayi', 'count'])

  if (!hasPlatformHeader || !hasCountHeader) {
    throw new Error('Platform import için zorunlu başlıklar: "Altyapı" ve "Adet".')
  }

  const parsed = rows
    .map((row) => {
      const name = normalizeText(getCell(row, ['altyapi', 'platform', 'platformadi', 'altyapiadi']))
      const count = toNumber(getCell(row, ['adet', 'sayi', 'count']))

      if (!name) return null
      return { name, count: Math.max(0, count) }
    })
    .filter((item): item is PlatformCount => item !== null)

  if (parsed.length === 0) {
    throw new Error('Dosyada geçerli "Altyapı" ve "Adet" satırı bulunamadı.')
  }

  return parsed
}

export function parseTopFirmsExcelRows(rows: RowRecord[]): TopFirm[] {
  const requiredHeaders = [
    hasAnyHeader(rows, ['magaza', 'marka', 'name', 'firma']),
    hasAnyHeader(rows, ['gpv', 'ilgiliaygpv', 'currentmonthgpv']),
    hasAnyHeader(rows, ['oncekiaygpv', 'previousmonthgpv', 'oncekigpv']),
    hasAnyHeader(rows, ['gonderi', 'shipmentsent', 'gonderisayisi']),
    hasAnyHeader(rows, ['ikaskargodegeri', 'ikaskargopaketadedi', 'ikascargovalue', 'ikaskargo']),
    hasAnyHeader(rows, ['pars', 'parsdurum', 'parsstatus']),
  ]

  const hasPwiHeader = hasAnyHeader(rows, ['pwi', 'pwidurum', 'pwistatus'])

  if (requiredHeaders.some((isExists) => !isExists)) {
    throw new Error(
      'Top 15 import için zorunlu başlıklar: Mağaza, GPV, Önceki Ay GPV, Gönderi, ikas Kargo Paket Adedi, PARS.',
    )
  }

  const parsed = rows
    .map((row, index) => {
      const rank = Math.max(
        1,
        Math.round(toNumber(getCell(row, ['rank', 'sira'])) || index + 1),
      )
      const name = normalizeText(getCell(row, ['magaza', 'marka', 'name', 'firma']))
      const sector = normalizeText(getCell(row, ['sektor', 'sector', 'kategori', 'sektoru']))
      const gpv = Math.max(0, toNumber(getCell(row, ['gpv', 'ilgiliaygpv', 'currentmonthgpv'])))
      const previousMonthGPV = Math.max(
        0,
        toNumber(getCell(row, ['oncekiaygpv', 'previousmonthgpv', 'oncekigpv'])),
      )
      const shipmentSent = Math.max(
        0,
        Math.round(toNumber(getCell(row, ['gonderi', 'shipmentsent', 'gonderisayisi']))),
      )
      const ikasCargoValue = Math.max(
        0,
        Math.round(
          toNumber(getCell(row, ['ikaskargodegeri', 'ikaskargopaketadedi', 'ikascargovalue', 'ikaskargo'])),
        ),
      )
      const usesPars = parseUsageStatus(getCell(row, ['pars', 'parsdurum', 'parsstatus']))
      const usesPwi = hasPwiHeader
        ? parseUsageStatus(getCell(row, ['pwi', 'pwidurum', 'pwistatus']))
        : false

      if (!name) return null

      return {
        rank,
        name,
        sector,
        gpv,
        previousMonthGPV,
        gpvChange: calculateGpvChangePercent(gpv, previousMonthGPV),
        shipmentSent,
        ikasCargoValue,
        usesPars,
        usesPwi,
      }
    })
    .filter((item): item is TopFirm => item !== null)

  if (parsed.length === 0) {
    throw new Error('Dosyada geçerli Top 15 satırı bulunamadı.')
  }

  const normalized = parsed
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 15)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      gpvChange: calculateGpvChangePercent(item.gpv, item.previousMonthGPV),
    }))

  const requiredMissing = normalized.some((item) => (
    !item.name
      || !Number.isFinite(item.gpv)
      || !Number.isFinite(item.previousMonthGPV)
      || !Number.isFinite(item.shipmentSent)
      || !Number.isFinite(item.ikasCargoValue)
  ))

  if (requiredMissing) {
    throw new Error(
      'Top 15 import için zorunlu alanlar eksik: Mağaza, GPV, Önceki Ay GPV, Gönderi, ikas Kargo Paket Adedi, PARS.',
    )
  }

  return normalized
}
