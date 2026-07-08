import { getPeriodKey } from '@/stores/dashboard-data-store'

export type Scope = 'monthly' | 'quarterly' | 'yearly'

export interface PeriodSelection {
  scope: Scope
  year: number
  /** month (1-12) for monthly | quarter (1-4) for quarterly | unused for yearly */
  value: number
}

export function getPeriodKeysForSelection(selection: PeriodSelection): string[] {
  const { scope, year, value } = selection
  if (scope === 'monthly') return [getPeriodKey(year, value)]
  if (scope === 'quarterly') {
    const start = (value - 1) * 3 + 1
    return [getPeriodKey(year, start), getPeriodKey(year, start + 1), getPeriodKey(year, start + 2)]
  }
  return Array.from({ length: 12 }, (_, i) => getPeriodKey(year, i + 1))
}

const SHORT_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

export function describeSelection(selection: PeriodSelection): string {
  if (selection.scope === 'monthly') return `${SHORT_MONTHS[selection.value - 1] ?? ''} ${selection.year}`
  if (selection.scope === 'quarterly') return `Q${selection.value} ${selection.year}`
  return `${selection.year} (Yıllık)`
}

/** Ayın (yıllık kapsamda Aralık, çeyreklikte çeyreğin son ayı) hangisi olduğunu döner — CSAT/legacy model kararı gibi tek-ay bağımlı hesaplar için. */
export function selectionEffectiveMonth(selection: PeriodSelection): number {
  if (selection.scope === 'monthly') return selection.value
  if (selection.scope === 'quarterly') return (selection.value - 1) * 3 + 3
  return 12
}

/** Seçili dönemle aynı uzunluktaki bir önceki dönemi döner (önceki ay/çeyrek/yıl) — %değişim karşılaştırmaları için. */
export function getPreviousPeriodSelection(selection: PeriodSelection): PeriodSelection {
  if (selection.scope === 'monthly') {
    return selection.value === 1
      ? { scope: 'monthly', year: selection.year - 1, value: 12 }
      : { scope: 'monthly', year: selection.year, value: selection.value - 1 }
  }
  if (selection.scope === 'quarterly') {
    return selection.value === 1
      ? { scope: 'quarterly', year: selection.year - 1, value: 4 }
      : { scope: 'quarterly', year: selection.year, value: selection.value - 1 }
  }
  return { scope: 'yearly', year: selection.year - 1, value: 1 }
}
