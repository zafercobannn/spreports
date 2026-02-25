export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function calculateGpvChangePercent(currentGpv: number, previousMonthGpv: number): number {
  const safeCurrent = Number.isFinite(currentGpv) ? currentGpv : 0
  const safePrevious = Number.isFinite(previousMonthGpv) ? previousMonthGpv : 0

  if (safePrevious <= 0) {
    return safeCurrent > 0 ? 100 : 0
  }

  return ((safeCurrent - safePrevious) / safePrevious) * 100
}

export function calculateParsUsageRatePercent(
  shipmentSent: number,
  ikasCargoValue: number,
): number {
  const safeShipment = Math.max(0, Number.isFinite(shipmentSent) ? shipmentSent : 0)
  const safeCargoValue = Math.max(0, Number.isFinite(ikasCargoValue) ? ikasCargoValue : 0)

  if (safeShipment <= 0) {
    return safeCargoValue > 0 ? 100 : 0
  }

  return clampPercent((safeCargoValue / safeShipment) * 100)
}
