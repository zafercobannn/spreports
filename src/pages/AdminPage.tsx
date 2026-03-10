import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, LogOut, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NumberInput } from '@/components/ui/number-input'
import { useAdminAuth } from '@/features/auth/AdminAuthProvider'
import { AdminLoginExperience } from '@/features/auth/AdminLoginExperience'
import { CohortHeatmapEditor } from '@/features/cohort/CohortHeatmapEditor'
import { RepresentativeSuccessAdmin } from '@/features/team-performance/RepresentativeSuccessAdmin'
import { useFilters } from '@/hooks/use-filters'
import { isCloudPersistenceEnabled } from '@/services/firebase/dashboard-period-service'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import type { CloudSyncStatus } from '@/stores/dashboard-data-store'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { TargetStatus } from '@/types/targets'
import { TURKISH_MONTHS, getMonthName } from '@/utils/date-utils'
import { calculateGpvChangePercent } from '@/utils/top-firm-metrics'
import { parsePlatformExcelRows, parseTopFirmsExcelRows, readSpreadsheetRows } from '@/utils/excel-import'
import { downloadPlatformTemplate, downloadTopFirmsTemplate } from '@/utils/import-templates'

const inputClassName =
  'h-9 w-full min-w-0 rounded-lg border border-border/80 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

const smallInputClassName =
  'h-8 w-full min-w-0 rounded-md border border-border/80 bg-white/90 px-2 text-xs text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

function toNumber(value: string): number {
  const normalized = value.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function getCloudSyncBadgeVariant(status: CloudSyncStatus) {
  switch (status) {
    case 'success':
      return 'success' as const
    case 'queued':
    case 'saving':
      return 'warning' as const
    case 'error':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function getCloudSyncLabel(status: CloudSyncStatus): string {
  switch (status) {
    case 'queued':
      return 'Kuyrukta'
    case 'saving':
      return 'Kaydediliyor'
    case 'success':
      return 'Kaydedildi'
    case 'error':
      return 'Hata'
    default:
      return 'Beklemede'
  }
}

function AdminWorkspace() {
  const { signOut, userEmail } = useAdminAuth()
  const { year: currentYear, month: currentMonth } = useFilters()
  const [editYear, setEditYear] = useState(currentYear)
  const [editMonth, setEditMonth] = useState(currentMonth)
  const [importInfo, setImportInfo] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const periodKey = useMemo(() => getPeriodKey(editYear, editMonth), [editYear, editMonth])

  const periodData = useDashboardDataStore((s) => s.periods[periodKey])
  const cloudSync = useDashboardDataStore((s) => s.cloudSyncByPeriod[periodKey])
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)
  const savePeriodNow = useDashboardDataStore((s) => s.savePeriodNow)
  const updatePeriodData = useDashboardDataStore((s) => s.updatePeriodData)
  const resetPeriod = useDashboardDataStore((s) => s.resetPeriod)
  const resetAll = useDashboardDataStore((s) => s.resetAll)

  useEffect(() => {
    ensurePeriod(editYear, editMonth)
  }, [editMonth, editYear, ensurePeriod])

  const patchPeriod = (updater: (current: DashboardPeriodData) => DashboardPeriodData) => {
    updatePeriodData(editYear, editMonth, updater)
  }

  const handlePlatformImport = async (file: File | null, mode: 'sp' | 'premium') => {
    if (!file) return
    setImportInfo(null)
    setImportError(null)

    try {
      const rows = await readSpreadsheetRows(file)
      const platforms = parsePlatformExcelRows(rows)
      patchPeriod((data) => ({
        ...data,
        monthlyGPV: {
          ...data.monthlyGPV,
          previousPlatformsSP: mode === 'sp' ? platforms : data.monthlyGPV.previousPlatformsSP,
          previousPlatformsPremiumOnboarding: mode === 'premium'
            ? platforms
            : data.monthlyGPV.previousPlatformsPremiumOnboarding,
        },
      }))
      setImportInfo(`${mode === 'sp' ? 'SP' : 'Premium Onboarding'} platform verisi yüklendi (${platforms.length} satır).`)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Platform dosyası yüklenemedi.')
    }
  }

  const handleTopFirmsImport = async (file: File | null) => {
    if (!file) return
    setImportInfo(null)
    setImportError(null)

    try {
      const rows = await readSpreadsheetRows(file)
      const firms = parseTopFirmsExcelRows(rows)
      patchPeriod((data) => ({
        ...data,
        topFirms: firms,
      }))
      setImportInfo(`Top 15 verisi yüklendi (${firms.length} firma).`)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Top 15 dosyası yüklenemedi.')
    }
  }

  if (!periodData) return null

  const cloudStatus = cloudSync?.status ?? 'idle'
  const lastSavedAtLabel = cloudSync?.lastSavedAt
    ? new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(cloudSync.lastSavedAt))
    : 'Henüz başarılı kayıt yok'
  const cloudSyncEnabled = isCloudPersistenceEnabled()

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-5">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Admin Paneli</CardTitle>
                <CardDescription>
                  Tüm veriler manuel düzenlenir, Firebase remote-first mimaride saklanır.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {userEmail && <Badge variant="outline">{userEmail}</Badge>}
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış
                </Button>
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
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base">Bulut Senkron Durumu</CardTitle>
                <CardDescription>
                  Firestore kayıt durumu seçili dönem için burada izlenir.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={cloudSyncEnabled ? 'success' : 'warning'}>
                  {cloudSyncEnabled ? 'Firebase Sync Aktif' : 'Local Fallback'}
                </Badge>
                <Badge variant={getCloudSyncBadgeVariant(cloudStatus)}>
                  {getCloudSyncLabel(cloudStatus)}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!cloudSyncEnabled || cloudStatus === 'saving'}
                  onClick={() => {
                    void savePeriodNow(editYear, editMonth)
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Şimdi Kaydet
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-white/70 p-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Dönem Anahtarı</p>
              <p className="mt-2 text-sm font-medium text-foreground">{periodKey}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-white/70 p-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Son Başarılı Kayıt</p>
              <p className="mt-2 text-sm font-medium text-foreground">{lastSavedAtLabel}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-white/70 p-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Firestore Path</p>
              <p className="mt-2 break-all text-sm font-medium text-foreground">dashboard_periods/{periodKey}</p>
            </div>
            {cloudSync?.lastError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 md:col-span-3">
                <p className="text-xs font-semibold tracking-[0.08em] text-destructive uppercase">Son Hata</p>
                <p className="mt-2 text-sm font-medium text-destructive">{cloudSync.lastError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {(importInfo || importError) && (
          <Card>
            <CardContent className="pt-6">
              {importInfo && <p className="text-sm font-medium text-emerald-700">{importInfo}</p>}
              {importError && <p className="text-sm font-medium text-destructive">{importError}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Aylık Genel Veriler</CardTitle>
            <CardDescription>Dashboard üst metrikleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">GPV</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.ikasGPV}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, ikasGPV: value },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">SP GPV</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.spGPV}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, spGPV: value },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">GPV Oranı (%)</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.gpvRatio}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, gpvRatio: value },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Canlı Hesap Sayısı</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.liveAccountCount}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, liveAccountCount: value },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Canlı SP (en az 1 ödeme)</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.liveSPCount}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, liveSPCount: value },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Aylık Live Sayısı (otomatik)</span>
                <div className="flex h-9 items-center rounded-lg border border-border/80 bg-muted/25 px-3 text-sm font-medium text-foreground">
                  {periodData.monthlyGPV.monthlyLiveCount}
                  <span className="ml-2 text-xs text-muted-foreground">
                    = Canlı SP + Premium Onboarding Live
                  </span>
                </div>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Toplam SP</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.totalSP}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: { ...data.monthlyGPV, totalSP: value },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Premium Onboarding Live Sayısı</span>
                <NumberInput
                  className={inputClassName}
                  value={periodData.monthlyGPV.premiumOnboardingLiveCount}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: {
                        ...data.monthlyGPV,
                        premiumOnboardingLiveCount: value,
                      },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Premium Onboarding Ort. Canlıya Alma (gün)</span>
                <NumberInput
                  step="0.1"
                  className={inputClassName}
                  value={periodData.monthlyGPV.premiumOnboardingAvgGoLiveDurationDays}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: {
                        ...data.monthlyGPV,
                        premiumOnboardingAvgGoLiveDurationDays: value,
                      },
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Scale Plus Ort. Canlıya Alma (gün)</span>
                <NumberInput
                  step="0.1"
                  className={inputClassName}
                  value={periodData.monthlyGPV.scalePlusAvgGoLiveDurationDays}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      monthlyGPV: {
                        ...data.monthlyGPV,
                        scalePlusAvgGoLiveDurationDays: value,
                      },
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">SP Önceki Platformlar</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPlatformTemplate('sp')}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Şablon CSV
                    </Button>
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border/80 bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/35">
                      <Upload className="h-3.5 w-3.5" />
                      CSV / Excel Import
                      <input
                        type="file"
                        accept=".csv,text/csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          void handlePlatformImport(e.target.files?.[0] ?? null, 'sp')
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: {
                            ...data.monthlyGPV,
                            previousPlatformsSP: [
                              ...data.monthlyGPV.previousPlatformsSP,
                              { name: '', count: 0 },
                            ],
                          },
                        }))
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Platform Ekle
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {periodData.monthlyGPV.previousPlatformsSP.map((platform, idx) => (
                    <div key={idx} className="grid grid-cols-[minmax(0,1fr)_minmax(0,160px)_40px] items-center gap-2">
                      <input
                        className={inputClassName}
                        value={platform.name}
                        onChange={(e) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              previousPlatformsSP: data.monthlyGPV.previousPlatformsSP.map((p, pIdx) =>
                                pIdx === idx ? { ...p, name: e.target.value } : p
                              ),
                            },
                          }))
                        }
                        placeholder="Altyapı adı"
                      />
                      <NumberInput
                        className={inputClassName}
                        value={platform.count}
                        onValueChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              previousPlatformsSP: data.monthlyGPV.previousPlatformsSP.map((p, pIdx) =>
                                pIdx === idx ? { ...p, count: value } : p
                              ),
                            },
                          }))
                        }
                        placeholder="Adet"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              previousPlatformsSP: data.monthlyGPV.previousPlatformsSP.filter((_, pIdx) => pIdx !== idx),
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

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Premium Onboarding Önceki Platformlar</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPlatformTemplate('premium')}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Şablon CSV
                    </Button>
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border/80 bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/35">
                      <Upload className="h-3.5 w-3.5" />
                      CSV / Excel Import
                      <input
                        type="file"
                        accept=".csv,text/csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          void handlePlatformImport(e.target.files?.[0] ?? null, 'premium')
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: {
                            ...data.monthlyGPV,
                            previousPlatformsPremiumOnboarding: [
                              ...data.monthlyGPV.previousPlatformsPremiumOnboarding,
                              { name: '', count: 0 },
                            ],
                          },
                        }))
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Platform Ekle
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {periodData.monthlyGPV.previousPlatformsPremiumOnboarding.map((platform, idx) => (
                    <div key={idx} className="grid grid-cols-[minmax(0,1fr)_minmax(0,160px)_40px] items-center gap-2">
                      <input
                        className={inputClassName}
                        value={platform.name}
                        onChange={(e) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              previousPlatformsPremiumOnboarding: data.monthlyGPV.previousPlatformsPremiumOnboarding.map((p, pIdx) =>
                                pIdx === idx ? { ...p, name: e.target.value } : p
                              ),
                            },
                          }))
                        }
                        placeholder="Altyapı adı"
                      />
                      <NumberInput
                        className={inputClassName}
                        value={platform.count}
                        onValueChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              previousPlatformsPremiumOnboarding: data.monthlyGPV.previousPlatformsPremiumOnboarding.map((p, pIdx) =>
                                pIdx === idx ? { ...p, count: value } : p
                              ),
                            },
                          }))
                        }
                        placeholder="Adet"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              previousPlatformsPremiumOnboarding: data.monthlyGPV.previousPlatformsPremiumOnboarding.filter((_, pIdx) => pIdx !== idx),
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Firmalar</CardTitle>
            <CardDescription>Top 15 tablosu - CSV ve Excel import destekli</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={downloadTopFirmsTemplate}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                Şablon CSV
              </Button>
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border/80 bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/35">
                <Upload className="h-3.5 w-3.5" />
                Top 15 CSV / Excel Import
                <input
                  type="file"
                  accept=".csv,text/csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    void handleTopFirmsImport(e.target.files?.[0] ?? null)
                    e.currentTarget.value = ''
                  }}
                />
              </label>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full min-w-[1080px] text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs">#</th>
                    <th className="px-2 py-2 text-left text-xs">Mağaza</th>
                    <th className="px-2 py-2 text-left text-xs">GPV</th>
                    <th className="px-2 py-2 text-left text-xs">Önceki GPV</th>
                    <th className="px-2 py-2 text-left text-xs">Değişim %</th>
                    <th className="px-2 py-2 text-left text-xs">ikas Kargo Paket Adedi</th>
                    <th className="px-2 py-2 text-left text-xs">PARS Durumu</th>
                    <th className="px-2 py-2 text-left text-xs" />
                  </tr>
                </thead>
                <tbody>
                  {periodData.topFirms.map((firm, idx) => {
                    const gpvChange = calculateGpvChangePercent(firm.gpv, firm.previousMonthGPV)
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
                          <NumberInput
                            className={smallInputClassName}
                            value={firm.gpv}
                            onValueChange={(value) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx ? { ...item, gpv: value } : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <NumberInput
                            className={smallInputClassName}
                            value={firm.previousMonthGPV}
                            onValueChange={(value) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx
                                    ? { ...item, previousMonthGPV: value }
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
                          <NumberInput
                            className={smallInputClassName}
                            value={firm.ikasCargoValue}
                            onValueChange={(value) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx
                                    ? { ...item, ikasCargoValue: Math.max(0, value) }
                                    : item
                                ),
                              }))
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            className={smallInputClassName}
                            value={firm.usesPars ? 'uses' : 'not-uses'}
                            onChange={(e) =>
                              patchPeriod((data) => ({
                                ...data,
                                topFirms: data.topFirms.map((item, itemIdx) =>
                                  itemIdx === idx
                                    ? { ...item, usesPars: e.target.value === 'uses' }
                                    : item
                                ),
                              }))
                            }
                          >
                            <option value="uses">Kullanıyor</option>
                            <option value="not-uses">Kullanmıyor</option>
                          </select>
                        </td>
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
                      usesPars: false,
                    },
                  ],
                }))
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Firma Ekle
            </Button>
            <p className="text-xs text-muted-foreground">
              CSV / Excel zorunlu alanları: `Mağaza`, `GPV`, `Önceki Ay GPV`, `Gönderi`, `ikas Kargo Paket Adedi`, `PARS`.
            </p>
          </CardContent>
        </Card>

        <RepresentativeSuccessAdmin
          data={periodData.representativeSuccess}
          weights={periodData.representativeWeights}
          monthLabel={getMonthName(editMonth)}
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
                <NumberInput
                  className={inputClassName}
                  value={target.estimatedRevenue}
                  onValueChange={(value) =>
                    patchPeriod((data) => ({
                      ...data,
                      targets: data.targets.map((item, itemIdx) =>
                        itemIdx === idx ? { ...item, estimatedRevenue: value } : item
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
                  <option value="not-live">Canlı Değil</option>
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
                  targets: [...data.targets, { name: '', sector: '', estimatedRevenue: 0, status: 'not-live' }],
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AdminPage() {
  const { isAdmin } = useAdminAuth()

  if (!isAdmin) {
    return <AdminLoginExperience />
  }

  return <AdminWorkspace />
}
