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

/**
 * Firma adını eşleştirme anahtarına indirger. Aynı firma ay ay farklı yazılabildiği için
 * ("ABC A.Ş." / "abc as") büyük-küçük harf, Türkçe karakter, boşluk ve noktalama farkları
 * eşleşmeyi bozmasın.
 */
function firmMatchKey(name: string): string {
  return name
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9]/g, '')
}

function sumFirmGpvByName(keys: string[], periods: Periods): Map<string, number> {
  const totals = new Map<string, number>()
  keys.forEach((key) => {
    ;(periods[key]?.topFirms ?? []).forEach((firm) => {
      const matchKey = firmMatchKey(firm.name)
      totals.set(matchKey, (totals.get(matchKey) ?? 0) + firm.gpv)
    })
  })
  return totals
}

/**
 * Firma isimine göre gruplayıp GPV'yi seçili aralık boyunca toplar, sonra yeniden sıralar.
 *
 * "Önceki dönem GPV"nin birincil kaynağı, o dönemin satırlarına import/admin ile girilen
 * `previousMonthGPV` alanıdır; aralık genişse ayların girilen değerleri toplanır (Q1'in
 * toplamı = Ara+Oca+Şub, yani bir önceki çeyrek). Girilmemişse (0) bir önceki eşdeğer
 * dönemin GPV toplamından türetilir. Türetme tek başına yeterli değil: bir firma bu dönem
 * listeye yeni girdiyse önceki dönemin Top 15'inde bulunmaz ve 0 döner — oysa girilen değer
 * doludur.
 */
export function aggregateTopFirms(selection: PeriodSelection, periods: Periods): TopFirm[] {
  const keys = getPeriodKeysForSelection(selection)
  const previousKeys = getPeriodKeysForSelection(getPreviousPeriodSelection(selection))
  const previousGpvByName = sumFirmGpvByName(previousKeys, periods)

  const byName = new Map<
    string,
    {
      name: string
      gpv: number
      enteredPreviousGPV: number
      shipmentSent: number
      ikasCargoValue: number
      usesPars: boolean
      usesPwi: boolean
    }
  >()
  keys.forEach((key) => {
    ;(periods[key]?.topFirms ?? []).forEach((firm) => {
      const matchKey = firmMatchKey(firm.name)
      const existing = byName.get(matchKey) ?? {
        name: firm.name,
        gpv: 0,
        enteredPreviousGPV: 0,
        shipmentSent: 0,
        ikasCargoValue: 0,
        usesPars: false,
        usesPwi: false,
      }
      existing.gpv += firm.gpv
      existing.enteredPreviousGPV += Math.max(0, firm.previousMonthGPV)
      existing.shipmentSent += firm.shipmentSent
      existing.ikasCargoValue += firm.ikasCargoValue
      existing.usesPars = existing.usesPars || firm.usesPars
      existing.usesPwi = existing.usesPwi || firm.usesPwi
      byName.set(matchKey, existing)
    })
  })

  return Array.from(byName.entries())
    .map(([matchKey, agg]) => {
      const previousMonthGPV = agg.enteredPreviousGPV > 0
        ? agg.enteredPreviousGPV
        : previousGpvByName.get(matchKey) ?? 0
      return {
        rank: 0,
        name: agg.name,
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
