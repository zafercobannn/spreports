import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { MonthlyGPV, PlatformCount } from '@/types/gpv'
import type { TopFirm } from '@/types/firms'
import type { TargetBrand } from '@/types/targets'
import { calculateGpvChangePercent } from '@/utils/top-firm-metrics'
import { getPeriodKeysForSelection, getPreviousPeriodSelection, type PeriodSelection } from '@/utils/period-selection'

type Periods = Record<string, DashboardPeriodData | undefined>

function sumPlatformCounts(lists: PlatformCount[][]): PlatformCount[] {
  const totals = new Map<string, number>()
  lists.forEach((list) => {
    list.forEach((platform) => {
      totals.set(platform.name, (totals.get(platform.name) ?? 0) + platform.count)
    })
  })
  return Array.from(totals.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/** Seçili dönemdeki tüm ayların monthlyGPV'sini toplar (sayaç/tutar alanları) veya ortalar (oran/süre alanları). */
export function aggregateMonthlyGPV(selection: PeriodSelection, periods: Periods): MonthlyGPV {
  const rows = getPeriodKeysForSelection(selection)
    .map((key) => periods[key]?.monthlyGPV)
    .filter((g): g is MonthlyGPV => Boolean(g))

  const sumField = (pick: (g: MonthlyGPV) => number) =>
    rows.reduce((acc, g) => acc + (Number.isFinite(pick(g)) ? pick(g) : 0), 0)
  const avgField = (pick: (g: MonthlyGPV) => number) => (rows.length > 0 ? sumField(pick) / rows.length : 0)

  const ikasGPV = sumField((g) => g.ikasGPV)
  const spGPV = sumField((g) => g.spGPV)

  return {
    month: selection.value,
    year: selection.year,
    ikasGPV,
    spGPV,
    gpvRatio: ikasGPV > 0 ? spGPV / ikasGPV : 0,
    liveAccountCount: sumField((g) => g.liveAccountCount),
    liveSPCount: sumField((g) => g.liveSPCount),
    monthlyLiveCount: sumField((g) => g.monthlyLiveCount),
    totalSP: sumField((g) => g.totalSP),
    premiumOnboardingLiveCount: sumField((g) => g.premiumOnboardingLiveCount),
    premiumOnboardingAvgGoLiveDurationDays: avgField((g) => g.premiumOnboardingAvgGoLiveDurationDays),
    scalePlusAvgGoLiveDurationDays: avgField((g) => g.scalePlusAvgGoLiveDurationDays),
    previousPlatformsSP: sumPlatformCounts(rows.map((g) => g.previousPlatformsSP)),
    previousPlatformsPremiumOnboarding: sumPlatformCounts(rows.map((g) => g.previousPlatformsPremiumOnboarding)),
    shikasGPV: sumField((g) => g.shikasGPV),
    gpvShare: avgField((g) => g.gpvShare),
    shikasShare: avgField((g) => g.shikasShare),
    liveSPShare: avgField((g) => g.liveSPShare),
  }
}

function sumFirmGpvByName(keys: string[], periods: Periods): Map<string, number> {
  const totals = new Map<string, number>()
  keys.forEach((key) => {
    ;(periods[key]?.topFirms ?? []).forEach((firm) => {
      totals.set(firm.name, (totals.get(firm.name) ?? 0) + firm.gpv)
    })
  })
  return totals
}

/**
 * Firma isimine göre gruplayıp GPV'yi seçili aralık boyunca toplar, sonra yeniden sıralar.
 * "Önceki dönem GPV"/"%değişim" burada dönem toplamı vs bir önceki eşdeğer dönem toplamı olarak hesaplanır
 * (örn. Q1 2026 vs Q4 2025) — tek ay karşılaştırmasıyla aynı mantık, sadece aralık genişletilmiş hâli.
 */
export function aggregateTopFirms(selection: PeriodSelection, periods: Periods): TopFirm[] {
  const keys = getPeriodKeysForSelection(selection)
  const previousKeys = getPeriodKeysForSelection(getPreviousPeriodSelection(selection))
  const previousGpvByName = sumFirmGpvByName(previousKeys, periods)

  const byName = new Map<
    string,
    { gpv: number; shipmentSent: number; ikasCargoValue: number; usesPars: boolean; usesPwi: boolean }
  >()
  keys.forEach((key) => {
    ;(periods[key]?.topFirms ?? []).forEach((firm) => {
      const existing = byName.get(firm.name) ?? {
        gpv: 0,
        shipmentSent: 0,
        ikasCargoValue: 0,
        usesPars: false,
        usesPwi: false,
      }
      existing.gpv += firm.gpv
      existing.shipmentSent += firm.shipmentSent
      existing.ikasCargoValue += firm.ikasCargoValue
      existing.usesPars = existing.usesPars || firm.usesPars
      existing.usesPwi = existing.usesPwi || firm.usesPwi
      byName.set(firm.name, existing)
    })
  })

  return Array.from(byName.entries())
    .map(([name, agg]) => {
      const previousMonthGPV = previousGpvByName.get(name) ?? 0
      return {
        rank: 0,
        name,
        gpv: agg.gpv,
        previousMonthGPV,
        gpvChange: calculateGpvChangePercent(agg.gpv, previousMonthGPV),
        shipmentSent: agg.shipmentSent,
        ikasCargoValue: agg.ikasCargoValue,
        usesPars: agg.usesPars,
        usesPwi: agg.usesPwi,
      }
    })
    .sort((a, b) => b.gpv - a.gpv)
    .map((firm, idx) => ({ ...firm, rank: idx + 1 }))
}

/** Hedef marka listelerini isme göre birleştirir (dedup); bir marka aralıktaki herhangi bir ayda "live" olduysa live sayılır. */
export function aggregateTargets(
  selection: PeriodSelection,
  periods: Periods,
): { targets: TargetBrand[]; targetCount: number; realizedCount: number } {
  const keys = getPeriodKeysForSelection(selection)
  const byName = new Map<string, TargetBrand>()
  let targetCount = 0
  let realizedCount = 0

  keys.forEach((key) => {
    const period = periods[key]
    if (!period) return
    targetCount += period.targetCount
    realizedCount += period.realizedCount ?? period.targets.filter((t) => t.status === 'live').length
    period.targets.forEach((target) => {
      const existing = byName.get(target.name)
      if (!existing || (target.status === 'live' && existing.status !== 'live')) {
        byName.set(target.name, target)
      }
    })
  })

  return { targets: Array.from(byName.values()), targetCount, realizedCount }
}
