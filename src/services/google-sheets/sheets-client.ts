import { SHEETS_CONFIG, type SheetRange } from './sheets-config'
import type { GoogleSheetsResponse } from '@/types/google-sheets'
import { SheetsFetchError } from '@/types/google-sheets'

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

export async function fetchSheetRange(range: SheetRange): Promise<GoogleSheetsResponse> {
  const { apiKey, spreadsheetId, ranges } = SHEETS_CONFIG
  const sheetRange = ranges[range]

  if (!apiKey || !spreadsheetId) {
    throw new Error('Google Sheets API key or Spreadsheet ID not configured')
  }

  const url = `${BASE_URL}/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}?key=${apiKey}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new SheetsFetchError(response.status, range)
  }

  return response.json() as Promise<GoogleSheetsResponse>
}

export async function fetchMultipleRanges(
  rangeKeys: SheetRange[],
): Promise<Record<string, GoogleSheetsResponse>> {
  const { apiKey, spreadsheetId, ranges } = SHEETS_CONFIG

  if (!apiKey || !spreadsheetId) {
    throw new Error('Google Sheets API key or Spreadsheet ID not configured')
  }

  const rangeParams = rangeKeys
    .map((key) => `ranges=${encodeURIComponent(ranges[key])}`)
    .join('&')

  const url = `${BASE_URL}/${spreadsheetId}/values:batchGet?${rangeParams}&key=${apiKey}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new SheetsFetchError(response.status, rangeKeys.join(', '))
  }

  const data = await response.json()
  const result: Record<string, GoogleSheetsResponse> = {}
  rangeKeys.forEach((key, idx) => {
    result[key] = data.valueRanges[idx]
  })
  return result
}
