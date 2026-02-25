export interface GoogleSheetsResponse {
  range: string
  majorDimension: string
  values: string[][]
}

export interface GoogleSheetsBatchResponse {
  spreadsheetId: string
  valueRanges: GoogleSheetsResponse[]
}

export class SheetsFetchError extends Error {
  statusCode: number
  range: string

  constructor(statusCode: number, range: string, message?: string) {
    super(message ?? `Failed to fetch sheet range "${range}": HTTP ${statusCode}`)
    this.name = 'SheetsFetchError'
    this.statusCode = statusCode
    this.range = range
  }
}
