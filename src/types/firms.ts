export interface TopFirm {
  rank: number
  name: string
  /** Firmanın faaliyet gösterdiği sektör. Eski kayıtlarda boş olabilir. */
  sector: string
  gpv: number
  previousMonthGPV: number
  gpvChange: number
  shipmentSent: number
  ikasCargoValue: number
  usesPars: boolean
  usesPwi: boolean
  // Legacy alan: eski verilerde yüzde saklanmış olabilir.
  parsUsageRate?: number
}

export interface FirmGPVComparison {
  name: string
  currentMonthGPV: number
  previousMonthGPV: number
  changePercent: number
}
