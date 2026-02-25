export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return (numerator / denominator) * 100
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function sum(values: number[]): number {
  return values.reduce((s, v) => s + v, 0)
}

export type TrendDirection = 'up' | 'down' | 'flat'

export function getTrendDirection(change: number, threshold = 0.5): TrendDirection {
  if (change > threshold) return 'up'
  if (change < -threshold) return 'down'
  return 'flat'
}
