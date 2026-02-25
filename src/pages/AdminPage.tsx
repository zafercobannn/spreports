import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CohortHeatmapEditor } from '@/features/cohort/CohortHeatmapEditor'
import { RepresentativeSuccessAdmin } from '@/features/team-performance/RepresentativeSuccessAdmin'
import { useFilters } from '@/hooks/use-filters'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import type { CohortMatrix } from '@/types/cohort'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { TargetStatus } from '@/types/targets'
import { TURKISH_MONTHS, getMonthName } from '@/utils/date-utils'
import { calculateGpvChangePercent, calculateParsUsageRatePercent } from '@/utils/top-firm-metrics'

const inputClassName =
  'h-9 w-full min-w-0 rounded-lg border border-border/80 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

const smallInputClassName =
  'h-8 w-full min-w-0 rounded-md border border-border/80 bg-white/90 px-2 text-xs text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

function toNumber(value: string): number {
  const normalized = value.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function isCohortMatrix(value: unknown): value is CohortMatrix {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.months) && Array.isArray(v.rows)
}

export function AdminPage() {
  const { year: currentYear, month: currentMonth } = useFilters()
  const [editYear, setEditYear] = useState(currentYear)
  const [editMonth, setEditMonth] = useState(currentMonth)
  const [cohortDraftMap, setCohortDraftMap] = useState<Record<string, string>>({})
  const [cohortError, setCohortError] = useState<string | null>(null)

  const periodKey = useMemo(() => getPeriodKey(editYear, editMonth), [editYear, editMonth])

  const periodData = useDashboardDataStore((s) => s.periods[periodKey])
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)
  const updatePeriodData = useDashboardDataStore((s) => s.updatePeriodData)
  const resetPeriod = useDashboardDataStore((s) => s.resetPeriod)
  const resetAll = useDashboardDataStore((s) => s.resetAll)

  useEffect(() => {
    ensurePeriod(editYear, editMonth)
  }, [editMonth, editYear, ensurePeriod])

  const patchPeriod = (updater: (current: DashboardPeriodData) => DashboardPeriodData) => {
    updatePeriodData(editYear, editMonth, updater)
  }

  if (!periodData) return null

  const cohortDraft = cohortDraftMap[periodKey] ?? JSON.stringify(periodData.cohort, null, 2)

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-5">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Admin Paneli</CardTitle>
                <CardDescription>
                  Tüm veriler manuel düzenlenir ve tarayıcıda otomatik saklanır.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetPeriod(editYear, editMonth)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Bu Dönemi Sıfırla
                </Button>
                <Button variant="destructive" size="sm" onClick={resetAll}>
                  Tüm Veriyi Sıfırla
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Yıl
                </label>
                <input
                  type="number"
                  className={inputClassName}
                  value={editYear}
                  onChange={(e) => {
                    setEditYear(Math.max(2020, toNumber(e.target.value)))
                    setCohortError(null)
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Ay
                </label>
                <select
                  className={inputClassName}
                  value={editMonth}
                  onChange={(e) => {
                    setEditMonth(Number(e.target.value))
                    setCohortError(null)
                  }}
                >
                  {TURKISH_MONTHS.map((name, idx) => (
                    <option key={name} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <Badge variant="outline">Dönem: {periodKey}</Badge>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aylık Genel Veriler</CardTitle>
            <CardDescription>Dashboard üst metrikleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">GPV</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.ikasGPV}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, ikasGPV: toNumber(e.target.value) },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">SP GPV</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.spGPV}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, spGPV: toNumber(e.target.value) },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">GPV Oranı (%)</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.gpvRatio}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, gpvRatio: toNumber(e.target.value) },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Canlı Hesap Sayısı</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.liveAccountCount}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, liveAccountCount: toNumber(e.target.value) },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Aylık Live Sayısı</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.monthlyLiveCount}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, monthlyLiveCount: toNumber(e.target.value) },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Toplam SP</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.totalSP}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, totalSP: toNumber(e.target.value) },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Premium Onboarding</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.monthlyGPV.premiumOnboardingLiveCount}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: {
                        ...data.monthlyGPV,
                        premiumOnboardingLiveCount: toNumber(e.target.value),
                      },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Ort. Canlıya Alma (gün)</span>
                <input
                  type="number"
                  step="0.1"
                  className={inputClassName}
                  value={periodData.monthlyGPV.avgGoLiveDurationDays}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: {
                        ...data.monthlyGPV,
                        avgGoLiveDurationDays: toNumber(e.target.value),
                      },
                    }))
                  }
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Önceki Platformlar</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: {
                        ...data.monthlyGPV,
                        previousPlatforms: [...data.monthlyGPV.previousPlatforms, { name: '', count: 0 }],
                      },
                    }))
                  }
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Platform Ekle
                </Button>
              </div>
              <div className="space-y-2">
                {periodData.monthlyGPV.previousPlatforms.map((platform, idx) => (
                  <div key={idx} className="grid grid-cols-[minmax(0,1fr)_minmax(0,160px)_40px] items-center gap-2">
                    <input
                      className={inputClassName}
                      value={platform.name}
                      onChange={(e) =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: {
                            ...data.monthlyGPV,
                            previousPlatforms: data.monthlyGPV.previousPlatforms.map((p, pIdx) =>
                              pIdx === idx ? { ...p, name: e.target.value } : p
                            ),
                          },
                        }))
                      }
                      placeholder="Platform adı"
                    />
                    <input
                      type="number"
                      className={inputClassName}
                      value={platform.count}
                      onChange={(e) =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: {
                            ...data.monthlyGPV,
                            previousPlatforms: data.monthlyGPV.previousPlatforms.map((p, pIdx) =>
                              pIdx === idx ? { ...p, count: toNumber(e.target.value) } : p
                            ),
                          },
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: {
                            ...data.monthlyGPV,
                            previousPlatforms: data.monthlyGPV.previousPlatforms.filter((_, pIdx) => pIdx !== idx),
                          },
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Firmalar</CardTitle>
            <CardDescription>PARS kullanan/kullanmayan oranı dahil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full min-w-[1080px] text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs">#</th>
                    <th className="px-2 py-2 text-left text-xs">Mağaza</th>
                    <th className="px-2 py-2 text-left text-xs">GPV</th>
                    <th className="px-2 py-2 text-left text-xs">Önceki GPV</th>
                    <th className="px-2 py-2 text-left text-xs">Değişim %</th>
                    <th className="px-2 py-2 text-left text-xs">Gönderi</th>
                    <th className="px-2 py-2 text-left text-xs">ikas Kargo Değeri</th>
                    <th className="px-2 py-2 text-left text-xs">PARS Kullanım %</th>
                    <th className="px-2 py-2 text-left text-xs">PARS Kullanmayan %</th>
                    <th className="px-2 py-2 text-left text-xs" />
                  </tr>
                </thead>
                <tbody>
                  {periodData.topFirms.map((firm, idx) => {
                    const gpvChange = calculateGpvChangePercent(firm.gpv, firm.previousMonthGPV)
                    const parsUsageRate = calculateParsUsageRatePercent(firm.shipmentSent, firm.ikasCargoValue)
                    const nonUsage = Math.max(0, 100 - parsUsageRate)
                    return (
                      <tr key={idx} className="border-t border-border/60">
                        <td className="px-2 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            className={smallInputClassName}
                            value={firm.name}
                            onChange={(e) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx ? { ...item, name: e.target.value } : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className={smallInputClassName}
                            value={firm.gpv}
                            onChange={(e) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx ? { ...item, gpv: toNumber(e.target.value) } : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className={smallInputClassName}
                            value={firm.previousMonthGPV}
                            onChange={(e) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx
                                    ? { ...item, previousMonthGPV: toNumber(e.target.value) }
                                    : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="h-8 rounded-md border border-border/70 bg-muted/35 px-2 text-right text-xs leading-8 font-medium text-foreground">
                            {gpvChange.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className={smallInputClassName}
                            value={firm.shipmentSent}
                            onChange={(e) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx ? { ...item, shipmentSent: toNumber(e.target.value) } : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className={smallInputClassName}
                            value={firm.ikasCargoValue}
                            onChange={(e) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx
                                    ? { ...item, ikasCargoValue: Math.max(0, toNumber(e.target.value)) }
                                    : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="h-8 rounded-md border border-border/70 bg-muted/35 px-2 text-right text-xs leading-8 font-medium text-foreground">
                            {parsUsageRate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-muted-foreground">{nonUsage.toFixed(1)}%</td>
                        <td className="px-2 py-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.filter((_, itemIdx) => itemIdx !== idx),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patchPeriod((data) => ({
                  ...data,
                  topFirms: [
                    ...data.topFirms,
                    {
                      rank: data.topFirms.length + 1,
                      name: '',
                      gpv: 0,
                      previousMonthGPV: 0,
                      gpvChange: 0,
                      shipmentSent: 0,
                      ikasCargoValue: 0,
                      parsUsageRate: 0,
                    },
                  ],
                }))
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Firma Ekle
            </Button>
            <p className="text-xs text-muted-foreground">
              ikas kargo için `0` = kullanmıyor, `0` üstü değer = kullanıyor kabul edilir.
            </p>
            <p className="text-xs text-muted-foreground">
              `Değişim %` = `(GPV - Önceki GPV) / Önceki GPV` ve `PARS Kullanım %` = `ikas Kargo Değeri / Gönderi` formülüyle otomatik hesaplanır.
            </p>
          </CardContent>
        </Card>

        <RepresentativeSuccessAdmin
          data={periodData.representativeSuccess}
          weights={periodData.representativeWeights}
          monthLabel={getMonthName(editMonth)}
          month={editMonth}
          year={editYear}
          onDataChange={(nextData) =>
            patchPeriod((data) => ({
              ...data,
              representativeSuccess: nextData,
            }))
          }
          onWeightsChange={(nextWeights) =>
            patchPeriod((data) => ({
              ...data,
              representativeWeights: nextWeights,
            }))
          }
        />

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hedef Markalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_40px] xl:items-center xl:gap-2 xl:px-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Marka</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Sektör</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Tahmini Ciro</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Durum</span>
                <span />
              </div>
              {periodData.targets.map((target, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_40px]"
                >
                  <input
                    className={inputClassName}
                    value={target.name}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        targets: data.targets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, name: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Marka"
                  />
                  <input
                    className={inputClassName}
                    value={target.sector}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        targets: data.targets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, sector: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Sektör"
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={target.estimatedRevenue}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        targets: data.targets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, estimatedRevenue: toNumber(e.target.value) } : item
                        ),
                      }))
                    }
                    placeholder="Tahmini ciro"
                  />
                  <select
                    className={inputClassName}
                    value={target.status}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        targets: data.targets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, status: e.target.value as TargetStatus } : item
                        ),
                      }))
                    }
                  >
                    <option value="live">Canlıda</option>
                    <option value="pending">Bekleniyor</option>
                    <option value="lost">Kaybedildi</option>
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      patchPeriod((data) => ({
                        ...data,
                        targets: data.targets.filter((_, itemIdx) => itemIdx !== idx),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  patchPeriod((data) => ({
                    ...data,
                    targets: [...data.targets, { name: '', sector: '', estimatedRevenue: 0, status: 'pending' }],
                  }))
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Marka Ekle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ekip Performansı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_40px] xl:items-center xl:gap-2 xl:px-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">SP</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Atanan</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Tamamlanan</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Süre (gün)</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Başarı</span>
                <span />
              </div>
              {periodData.teamPerformance.map((member, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_40px]"
                >
                  <input
                    className={inputClassName}
                    value={member.member.name}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        teamPerformance: data.teamPerformance.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, member: { ...item.member, name: e.target.value } } : item
                        ),
                      }))
                    }
                    placeholder="SP adı"
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={member.assignedCount}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        teamPerformance: data.teamPerformance.map((item, itemIdx) => {
                          if (itemIdx !== idx) return item
                          const assignedCount = toNumber(e.target.value)
                          const completionRate =
                            assignedCount <= 0 ? 0 : Math.round((item.completedCount / assignedCount) * 100)
                          return { ...item, assignedCount, completionRate }
                        }),
                      }))
                    }
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={member.completedCount}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        teamPerformance: data.teamPerformance.map((item, itemIdx) => {
                          if (itemIdx !== idx) return item
                          const completedCount = toNumber(e.target.value)
                          const completionRate =
                            item.assignedCount <= 0 ? 0 : Math.round((completedCount / item.assignedCount) * 100)
                          return { ...item, completedCount, completionRate }
                        }),
                      }))
                    }
                  />
                  <input
                    type="number"
                    step="0.1"
                    className={inputClassName}
                    value={member.avgDurationDays}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        teamPerformance: data.teamPerformance.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, avgDurationDays: toNumber(e.target.value) } : item
                        ),
                      }))
                    }
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={member.successScore}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        teamPerformance: data.teamPerformance.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, successScore: toNumber(e.target.value) } : item
                        ),
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      patchPeriod((data) => ({
                        ...data,
                        teamPerformance: data.teamPerformance.filter((_, itemIdx) => itemIdx !== idx),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  patchPeriod((data) => ({
                    ...data,
                    teamPerformance: [
                      ...data.teamPerformance,
                      {
                        member: { id: `sp-${Date.now()}`, name: '' },
                        assignedCount: 0,
                        completedCount: 0,
                        completionRate: 0,
                        avgDurationDays: 0,
                        successScore: 0,
                      },
                    ],
                  }))
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                SP Ekle
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Hedefler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_40px] xl:items-center xl:gap-2 xl:px-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Metrik</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Hedef</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Gerçekleşen</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Birim</span>
                <span />
              </div>
              {periodData.monthlyTargets.map((target, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_40px]"
                >
                  <input
                    className={inputClassName}
                    value={target.metricName}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        monthlyTargets: data.monthlyTargets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, metricName: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Metrik adı"
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={target.targetValue}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        monthlyTargets: data.monthlyTargets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, targetValue: toNumber(e.target.value) } : item
                        ),
                      }))
                    }
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={target.actualValue}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        monthlyTargets: data.monthlyTargets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, actualValue: toNumber(e.target.value) } : item
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClassName}
                    value={target.unit}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        monthlyTargets: data.monthlyTargets.map((item, itemIdx) =>
                          itemIdx === idx ? { ...item, unit: e.target.value } : item
                        ),
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      patchPeriod((data) => ({
                        ...data,
                        monthlyTargets: data.monthlyTargets.filter((_, itemIdx) => itemIdx !== idx),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  patchPeriod((data) => ({
                    ...data,
                    monthlyTargets: [...data.monthlyTargets, { metricName: '', targetValue: 0, actualValue: 0, unit: '' }],
                  }))
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Hedef Ekle
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Başarı Endeksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Genel Skor</span>
                <input
                  type="number"
                  className={inputClassName}
                  value={periodData.successIndex.overallScore}
                  onChange={(e) =>
                    patchPeriod((data) => ({
                      ...data,
                      successIndex: {
                        ...data.successIndex,
                        overallScore: toNumber(e.target.value),
                      },
                    }))
                  }
                />
              </label>

              <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.65fr)_minmax(0,0.65fr)_40px] xl:items-center xl:gap-2 xl:px-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Metrik</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Değer</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Ağırlık</span>
                <span />
              </div>

              {periodData.successIndex.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.65fr)_minmax(0,0.65fr)_40px]"
                >
                  <input
                    className={inputClassName}
                    value={metric.label}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        successIndex: {
                          ...data.successIndex,
                          metrics: data.successIndex.metrics.map((item, itemIdx) =>
                            itemIdx === idx ? { ...item, label: e.target.value } : item
                          ),
                        },
                      }))
                    }
                    placeholder="Metrik"
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={metric.value}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        successIndex: {
                          ...data.successIndex,
                          metrics: data.successIndex.metrics.map((item, itemIdx) =>
                            itemIdx === idx ? { ...item, value: toNumber(e.target.value) } : item
                          ),
                        },
                      }))
                    }
                  />
                  <input
                    type="number"
                    className={inputClassName}
                    value={metric.weight}
                    onChange={(e) =>
                      patchPeriod((data) => ({
                        ...data,
                        successIndex: {
                          ...data.successIndex,
                          metrics: data.successIndex.metrics.map((item, itemIdx) =>
                            itemIdx === idx ? { ...item, weight: toNumber(e.target.value) } : item
                          ),
                        },
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      patchPeriod((data) => ({
                        ...data,
                        successIndex: {
                          ...data.successIndex,
                          metrics: data.successIndex.metrics.filter((_, itemIdx) => itemIdx !== idx),
                        },
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  patchPeriod((data) => ({
                    ...data,
                    successIndex: {
                      ...data.successIndex,
                      metrics: [...data.successIndex.metrics, { label: '', value: 0, weight: 0 }],
                    },
                  }))
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Başarı Metrik Ekle
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cohort Verisi</CardTitle>
            <CardDescription>
              Hücrelerin içinden doğrudan değer girerek grafiği düzenleyebilirsin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CohortHeatmapEditor
              data={periodData.cohort}
              onChange={(nextCohort) =>
                patchPeriod((data) => ({
                  ...data,
                  cohort: nextCohort,
                }))
              }
            />

            <details className="rounded-xl border border-border/70 bg-white/65 p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Gelişmiş: JSON ile düzenle
              </summary>
              <div className="mt-3 space-y-3">
                <textarea
                  className="min-h-[260px] w-full rounded-xl border border-border/80 bg-white/95 p-3 font-mono text-xs outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  value={cohortDraft}
                  onChange={(e) => {
                    setCohortDraftMap((prev) => ({ ...prev, [periodKey]: e.target.value }))
                    setCohortError(null)
                  }}
                />
                {cohortError && (
                  <p className="text-sm font-medium text-destructive">{cohortError}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(cohortDraft)
                        if (!isCohortMatrix(parsed)) {
                          setCohortError('JSON formatı cohort matrisi ile uyumlu değil.')
                          return
                        }
                        patchPeriod((data) => ({
                          ...data,
                          cohort: parsed,
                        }))
                        setCohortDraftMap((prev) => ({
                          ...prev,
                          [periodKey]: JSON.stringify(parsed, null, 2),
                        }))
                        setCohortError(null)
                      } catch {
                        setCohortError('JSON parse edilemedi. Lütfen formatı kontrol et.')
                      }
                    }}
                  >
                    Cohort JSON Kaydet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCohortDraftMap((prev) => ({
                        ...prev,
                        [periodKey]: JSON.stringify(periodData.cohort, null, 2),
                      }))
                    }
                  >
                    Geri Al
                  </Button>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
