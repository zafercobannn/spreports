import type { GoogleSheetsResponse } from '@/types/google-sheets'

export interface ParsedSheet<T> {
  headers: string[]
  rows: T[]
}

export function parseSheetResponse<T extends Record<string, unknown>>(
  response: GoogleSheetsResponse,
  columnMap?: Record<string, string>,
): ParsedSheet<T> {
  if (!response.values || response.values.length < 2) {
    return { headers: [], rows: [] }
  }

  const [headerRow, ...dataRows] = response.values
  const headers = headerRow.map((h) => h.trim())

  const rows = dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) => {
      const obj: Record<string, unknown> = {}
      headers.forEach((header, idx) => {
        const key = columnMap?.[header] ?? header
        obj[key] = row[idx]?.trim() ?? ''
      })
      return obj as T
    })

  return { headers, rows }
}

export function parseNumber(value: string): number {
  if (!value || value === '#N/A' || value === '-') return 0
  const cleaned = value
    .replace(/[^\d.,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return Number(cleaned) || 0
}
