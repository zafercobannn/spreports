export interface TopFirm {
  rank: number
  name: string
  gpv: number
  previousMonthGPV: number
  gpvChange: number
  shipmentSent: number
  ikasCargoValue: number
  parsUsageRate: number
}

export interface FirmGPVComparison {
  name: string
  currentMonthGPV: number
  previousMonthGPV: number
  changePercent: number
}
