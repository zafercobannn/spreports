export const SHEETS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as string,
  spreadsheetId: import.meta.env.VITE_SPREADSHEET_ID as string,

  ranges: {
    monthlyGPV: 'MonthlyGPV!A1:Z',
    cohortData: 'CohortData!A1:Z',
    topFirms: 'TopFirms!A1:Z',
    targets: 'Targets!A1:Z',
    teamPerformance: 'TeamPerformance!A1:Z',
    monthlyTargets: 'MonthlyTargets!A1:Z',
  },
} as const

export type SheetRange = keyof typeof SHEETS_CONFIG.ranges
