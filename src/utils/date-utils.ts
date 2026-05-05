export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
] as const

export function getMonthName(month: number): string {
  return TURKISH_MONTHS[month - 1] ?? ''
}

export function getMonthIndex(name: string): number {
  const normalized = name.toLowerCase().replace(/[ışüöçğ]/g, (c) => {
    const map: Record<string, string> = { 'ı': 'i', 'ş': 's', 'ü': 'u', 'ö': 'o', 'ç': 'c', 'ğ': 'g' }
    return map[c] ?? c
  })
  const idx = TURKISH_MONTHS.findIndex(
    (m) => m.toLowerCase() === normalized
  )
  return idx >= 0 ? idx + 1 : -1
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getPreviousMonthAndYear(): { month: number; year: number } {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  if (month === 1) {
    return { month: 12, year: year - 1 }
  }
  return { month: month - 1, year }
}

export function getMonthRange(startMonth: number, endMonth: number): number[] {
  const months: number[] = []
  for (let m = startMonth; m <= endMonth; m++) {
    months.push(m)
  }
  return months
}
