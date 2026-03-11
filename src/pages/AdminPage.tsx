import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { AdminInlineStatus } from '@/features/admin/AdminInlineStatus'
import { AdminSidebar } from '@/features/admin/AdminSidebar'
import { AdminSectionCard } from '@/features/admin/AdminSectionCard'
import { AdminSyncBar } from '@/features/admin/AdminSyncBar'
import { useAdminAuth } from '@/features/auth/AdminAuthProvider'
import { AdminLoginExperience } from '@/features/auth/AdminLoginExperience'
import { CohortHeatmapEditor } from '@/features/cohort/CohortHeatmapEditor'
import { RepresentativeSuccessAdmin } from '@/features/team-performance/RepresentativeSuccessAdmin'
import { parseRepresentativeCsv } from '@/features/team-performance/representative-success-utils'
import { useFilters } from '@/hooks/use-filters'
import { isCloudPersistenceEnabled } from '@/services/firebase/dashboard-period-service'
import { getPeriodKey, useDashboardDataStore } from '@/stores/dashboard-data-store'
import type { CloudSyncStatus } from '@/stores/dashboard-data-store'
import type { DashboardPeriodData } from '@/types/dashboard-data'
import type { TopFirm } from '@/types/firms'
import type { PlatformCount } from '@/types/gpv'
import type { TargetBrand, TargetStatus } from '@/types/targets'
import { TURKISH_MONTHS, getMonthName } from '@/utils/date-utils'
import { parsePlatformExcelRows, parseTopFirmsExcelRows, readSpreadsheetRows } from '@/utils/excel-import'
import {
  downloadPlatformTemplate,
  downloadRepresentativeTemplate,
  downloadTopFirmsTemplate,
} from '@/utils/import-templates'
import { calculateGpvChangePercent } from '@/utils/top-firm-metrics'

const inputClassName =
  'h-10 w-full min-w-0 rounded-xl border border-border/75 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-primary/15'

const smallInputClassName =
  'h-9 w-full min-w-0 rounded-xl border border-border/75 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-primary/15'

const adminSectionItems = [
  { id: 'general', label: 'Genel Veriler' },
  { id: 'top-firms', label: 'Top Firmalar' },
  { id: 'targets', label: 'Hedef Markalar' },
  { id: 'team', label: 'Takım Performansı' },
  { id: 'cohort', label: 'Cohort' },
] as const

type AdminSectionId = (typeof adminSectionItems)[number]['id']

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

function FieldGroup({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-[1.6rem] border border-border/65 bg-white/72 p-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function MetricField({
  label,
  value,
  onChange,
  step,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: string
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <NumberInput className={inputClassName} value={value} onValueChange={onChange} step={step} />
    </label>
  )
}

function ReadOnlyMetricField({
  label,
  value,
  helper,
}: {
  label: string
  value: number
  helper?: string
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex min-h-10 flex-col justify-center rounded-xl border border-border/75 bg-background/60 px-3 py-2">
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </div>
    </div>
  )
}

function PlatformEditorPanel({
  title,
  items,
  onItemsChange,
}: {
  title: string
  items: PlatformCount[]
  onItemsChange: (next: PlatformCount[]) => void
}) {
  return (
    <FieldGroup label={title}>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/75 bg-background/45 px-4 py-5 text-sm text-muted-foreground">
            Kayıt yok. Elle ekleyebilir veya üst bardan içe aktarabilirsin.
          </div>
        )}

        {items.map((platform, index) => (
          <div
            key={`${platform.name}-${index}`}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-white/78 p-3 md:grid-cols-[minmax(0,1fr)_170px_42px]"
          >
            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase md:hidden">
                Altyapı
              </span>
              <input
                className={inputClassName}
                value={platform.name}
                onChange={(event) =>
                  onItemsChange(items.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, name: event.target.value } : item
                  )))
                }
                placeholder="Altyapı adı"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase md:hidden">
                Adet
              </span>
              <NumberInput
                className={inputClassName}
                value={platform.count}
                onValueChange={(value) =>
                  onItemsChange(items.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, count: Math.max(0, value) } : item
                  )))
                }
                placeholder="Adet"
              />
            </label>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={() => onItemsChange(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onItemsChange([...items, { name: '', count: 0 }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Platform Ekle
        </Button>
      </div>
    </FieldGroup>
  )
}

function TopFirmsEditor({
  data,
  onChange,
}: {
  data: TopFirm[]
  onChange: (next: TopFirm[]) => void
}) {
  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[56px_minmax(0,1.4fr)_160px_160px_120px_170px_170px_44px] gap-3 px-2 xl:grid">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">#</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Mağaza</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">GPV</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Önceki GPV</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Değişim %</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">ikas Kargo</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">PARS</span>
        <span />
      </div>

      {data.map((firm, index) => {
        const gpvChange = calculateGpvChangePercent(firm.gpv, firm.previousMonthGPV)

        return (
          <div
            key={`${firm.name}-${index}`}
            className="grid grid-cols-1 gap-3 rounded-[1.6rem] border border-border/60 bg-white/78 p-4 xl:grid-cols-[56px_minmax(0,1.4fr)_160px_160px_120px_170px_170px_44px]"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Sıra</span>
              <div className="flex h-10 items-center rounded-xl border border-border/65 bg-background/55 px-3 text-sm font-semibold text-foreground">
                {index + 1}
              </div>
            </div>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Mağaza</span>
              <input
                className={smallInputClassName}
                value={firm.name}
                onChange={(event) =>
                  onChange(data.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, name: event.target.value } : item
                  )))
                }
                placeholder="Mağaza"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">GPV</span>
              <NumberInput
                className={smallInputClassName}
                value={firm.gpv}
                onValueChange={(value) =>
                  onChange(data.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, gpv: value } : item
                  )))
                }
              />
            </label>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Önceki GPV</span>
              <NumberInput
                className={smallInputClassName}
                value={firm.previousMonthGPV}
                onValueChange={(value) =>
                  onChange(data.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, previousMonthGPV: value } : item
                  )))
                }
              />
            </label>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Değişim %</span>
              <div className="flex h-9 items-center rounded-xl border border-border/65 bg-background/55 px-3 text-sm font-semibold text-foreground">
                {gpvChange.toFixed(1)}%
              </div>
            </div>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">ikas Kargo</span>
              <NumberInput
                className={smallInputClassName}
                value={firm.ikasCargoValue}
                onValueChange={(value) =>
                  onChange(data.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, ikasCargoValue: Math.max(0, value) } : item
                  )))
                }
              />
            </label>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">PARS</span>
              <select
                className={smallInputClassName}
                value={firm.usesPars ? 'uses' : 'not-uses'}
                onChange={(event) =>
                  onChange(data.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, usesPars: event.target.value === 'uses' } : item
                  )))
                }
              >
                <option value="uses">Kullanıyor</option>
                <option value="not-uses">Kullanmıyor</option>
              </select>
            </label>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => onChange(data.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TargetsEditor({
  data,
  onChange,
}: {
  data: TargetBrand[]
  onChange: (next: TargetBrand[]) => void
}) {
  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_180px_180px_44px] gap-3 px-2 xl:grid">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Marka</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Sektör</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Tahmini Ciro</span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Durum</span>
        <span />
      </div>

      {data.map((target, index) => (
        <div
          key={`${target.name}-${index}`}
          className="grid grid-cols-1 gap-3 rounded-[1.6rem] border border-border/60 bg-white/78 p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_180px_180px_44px]"
        >
          <label className="space-y-1">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Marka</span>
            <input
              className={inputClassName}
              value={target.name}
              onChange={(event) =>
                onChange(data.map((item, itemIndex) => (
                  itemIndex === index ? { ...item, name: event.target.value } : item
                )))
              }
              placeholder="Marka"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Sektör</span>
            <input
              className={inputClassName}
              value={target.sector}
              onChange={(event) =>
                onChange(data.map((item, itemIndex) => (
                  itemIndex === index ? { ...item, sector: event.target.value } : item
                )))
              }
              placeholder="Sektör"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Tahmini Ciro</span>
            <NumberInput
              className={inputClassName}
              value={target.estimatedRevenue}
              onValueChange={(value) =>
                onChange(data.map((item, itemIndex) => (
                  itemIndex === index ? { ...item, estimatedRevenue: value } : item
                )))
              }
              placeholder="Tahmini ciro"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase xl:hidden">Durum</span>
            <select
              className={inputClassName}
              value={target.status}
              onChange={(event) =>
                onChange(data.map((item, itemIndex) => (
                  itemIndex === index ? { ...item, status: event.target.value as TargetStatus } : item
                )))
              }
            >
              <option value="live">Canlıda</option>
              <option value="not-live">Canlı Değil</option>
            </select>
          </label>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => onChange(data.filter((_, itemIndex) => itemIndex !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminWorkspace() {
  const { signOut, userEmail } = useAdminAuth()
  const { year: currentYear, month: currentMonth } = useFilters()
  const [editYear, setEditYear] = useState(currentYear)
  const [editMonth, setEditMonth] = useState(currentMonth)
  const [importInfo, setImportInfo] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<AdminSectionId>('general')

  const periodKey = useMemo(() => getPeriodKey(editYear, editMonth), [editYear, editMonth])

  const periodData = useDashboardDataStore((state) => state.periods[periodKey])
  const cloudSync = useDashboardDataStore((state) => state.cloudSyncByPeriod[periodKey])
  const ensurePeriod = useDashboardDataStore((state) => state.ensurePeriod)
  const savePeriodNow = useDashboardDataStore((state) => state.savePeriodNow)
  const updatePeriodData = useDashboardDataStore((state) => state.updatePeriodData)
  const resetPeriod = useDashboardDataStore((state) => state.resetPeriod)
  const resetAll = useDashboardDataStore((state) => state.resetAll)

  const sectionRefs = useRef<Record<AdminSectionId, HTMLElement | null>>({
    general: null,
    'top-firms': null,
    targets: null,
    team: null,
    cohort: null,
  })

  useEffect(() => {
    ensurePeriod(editYear, editMonth)
  }, [editMonth, editYear, ensurePeriod])

  useEffect(() => {
    if (!periodData) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!visible) return

        const sectionId = visible.target.getAttribute('data-section') as AdminSectionId | null
        if (sectionId) setActiveSection(sectionId)
      },
      {
        rootMargin: '-20% 0px -58% 0px',
        threshold: [0.2, 0.45, 0.7],
      },
    )

    Object.values(sectionRefs.current).forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [periodData])

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

  const handleRepresentativeImport = async (file: File | null) => {
    if (!file) return
    setImportInfo(null)
    setImportError(null)

    try {
      const text = await file.text()
      const parsed = parseRepresentativeCsv(text)
      patchPeriod((data) => ({
        ...data,
        representativeSuccess: parsed,
      }))
      setImportInfo(`${parsed.length} temsilci verisi yüklendi.`)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Temsilci CSV dosyası yüklenemedi.')
    }
  }

  const handleSelectSection = (sectionId: string) => {
    const resolved = sectionId as AdminSectionId
    setActiveSection(resolved)
    sectionRefs.current[resolved]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const setSectionRef = (sectionId: AdminSectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[sectionId] = node
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

  const importControls = [
    {
      id: 'platform-sp',
      label: 'SP Platform',
      accept: '.csv,text/csv,.xlsx,.xls',
      onTemplateDownload: () => downloadPlatformTemplate('sp'),
      onFileSelect: (file: File | null) => {
        void handlePlatformImport(file, 'sp')
      },
    },
    {
      id: 'platform-premium',
      label: 'Premium Platform',
      accept: '.csv,text/csv,.xlsx,.xls',
      onTemplateDownload: () => downloadPlatformTemplate('premium'),
      onFileSelect: (file: File | null) => {
        void handlePlatformImport(file, 'premium')
      },
    },
    {
      id: 'top-firms',
      label: 'Top 15',
      accept: '.csv,text/csv,.xlsx,.xls',
      onTemplateDownload: downloadTopFirmsTemplate,
      onFileSelect: (file: File | null) => {
        void handleTopFirmsImport(file)
      },
    },
    {
      id: 'representatives',
      label: 'Temsilci CSV',
      accept: '.csv,text/csv',
      onTemplateDownload: downloadRepresentativeTemplate,
      onFileSelect: (file: File | null) => {
        void handleRepresentativeImport(file)
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1680px] gap-4 pb-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4">
          <AdminSidebar
            activeSection={activeSection}
            importControls={importControls}
            isSaving={cloudStatus === 'saving'}
            months={TURKISH_MONTHS}
            onMonthChange={(value) => setEditMonth(Math.min(12, Math.max(1, value)))}
            onResetAll={resetAll}
            onResetPeriod={() => resetPeriod(editYear, editMonth)}
            onSaveNow={() => {
              void savePeriodNow(editYear, editMonth)
            }}
            onSelectSection={handleSelectSection}
            onSignOut={() => {
              void signOut()
            }}
            onYearChange={(value) => setEditYear(Math.max(2020, Math.round(value || editYear)))}
            sections={adminSectionItems}
            userEmail={userEmail}
            year={editYear}
            month={editMonth}
          />
        </aside>

        <div className="space-y-4">
          <div className="sticky top-3 z-30">
            <AdminSyncBar
              periodKey={periodKey}
              cloudSyncEnabled={cloudSyncEnabled}
              cloudStatusLabel={getCloudSyncLabel(cloudStatus)}
              cloudStatusVariant={getCloudSyncBadgeVariant(cloudStatus)}
              lastSavedAtLabel={lastSavedAtLabel}
              syncError={cloudSync?.lastError}
            />
          </div>

          <AdminInlineStatus message={importError ?? importInfo} tone={importError ? 'error' : 'success'} />

          <section
            ref={setSectionRef('general')}
            data-section="general"
            className="scroll-mt-24 space-y-4 lg:scroll-mt-28"
          >
            <AdminSectionCard
              eyebrow="Genel"
              title="Aylık Genel Veriler"
              description="En sık düzenlenen temel metrikler ve platform dağılımı."
            >
              <div className="space-y-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <FieldGroup label="GPV ve Hacim">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
                      <MetricField
                        label="GPV"
                        value={periodData.monthlyGPV.ikasGPV}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, ikasGPV: value },
                          }))
                        }
                      />
                      <MetricField
                        label="SP GPV"
                        value={periodData.monthlyGPV.spGPV}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, spGPV: value },
                          }))
                        }
                      />
                      <MetricField
                        label="GPV Oranı (%)"
                        value={periodData.monthlyGPV.gpvRatio}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, gpvRatio: value },
                          }))
                        }
                      />
                      <MetricField
                        label="Toplam SP"
                        value={periodData.monthlyGPV.totalSP}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, totalSP: value },
                          }))
                        }
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Canlı Hesap / Onboarding">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
                      <MetricField
                        label="Canlı Hesap Sayısı"
                        value={periodData.monthlyGPV.liveAccountCount}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, liveAccountCount: value },
                          }))
                        }
                      />
                      <MetricField
                        label="Canlı SP (en az 1 ödeme)"
                        value={periodData.monthlyGPV.liveSPCount}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, liveSPCount: value },
                          }))
                        }
                      />
                      <ReadOnlyMetricField
                        label="Aylık Live Sayısı"
                        value={periodData.monthlyGPV.monthlyLiveCount}
                        helper="Canlı SP + Premium Onboarding Live"
                      />
                      <MetricField
                        label="Premium Onboarding Live"
                        value={periodData.monthlyGPV.premiumOnboardingLiveCount}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: { ...data.monthlyGPV, premiumOnboardingLiveCount: value },
                          }))
                        }
                      />
                      <MetricField
                        label="Premium Onboarding Ort. Süre (gün)"
                        value={periodData.monthlyGPV.premiumOnboardingAvgGoLiveDurationDays}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              premiumOnboardingAvgGoLiveDurationDays: value,
                            },
                          }))
                        }
                        step="0.1"
                      />
                      <MetricField
                        label="Scale Plus Ort. Süre (gün)"
                        value={periodData.monthlyGPV.scalePlusAvgGoLiveDurationDays}
                        onChange={(value) =>
                          patchPeriod((data) => ({
                            ...data,
                            monthlyGPV: {
                              ...data.monthlyGPV,
                              scalePlusAvgGoLiveDurationDays: value,
                            },
                          }))
                        }
                        step="0.1"
                      />
                    </div>
                  </FieldGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Platform Dağılımı</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Platform listelerini elle düzenleyebilir veya soldaki panelden toplu içe aktarabilirsin.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    <PlatformEditorPanel
                      title="SP Önceki Platformlar"
                      items={periodData.monthlyGPV.previousPlatformsSP}
                      onItemsChange={(next) =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: { ...data.monthlyGPV, previousPlatformsSP: next },
                        }))
                      }
                    />
                    <PlatformEditorPanel
                      title="Premium Onboarding Önceki Platformlar"
                      items={periodData.monthlyGPV.previousPlatformsPremiumOnboarding}
                      onItemsChange={(next) =>
                        patchPeriod((data) => ({
                          ...data,
                          monthlyGPV: { ...data.monthlyGPV, previousPlatformsPremiumOnboarding: next },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          </section>

          <section
            ref={setSectionRef('top-firms')}
            data-section="top-firms"
            className="scroll-mt-24 space-y-4 lg:scroll-mt-28"
          >
            <AdminSectionCard
              eyebrow="Ticari Görünüm"
              title="Top Firmalar"
              description="Top 15 listesini satır bazında hızlıca düzenle."
              actions={(
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
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
              )}
            >
              <div className="space-y-4">
                <TopFirmsEditor
                  data={periodData.topFirms}
                  onChange={(next) =>
                    patchPeriod((data) => ({
                      ...data,
                      topFirms: next.map((item, index) => ({
                        ...item,
                        rank: index + 1,
                        gpvChange: calculateGpvChangePercent(item.gpv, item.previousMonthGPV),
                      })),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  CSV / Excel zorunlu alanları: `Mağaza`, `GPV`, `Önceki Ay GPV`, `Gönderi`, `ikas Kargo Paket Adedi`, `PARS`.
                </p>
              </div>
            </AdminSectionCard>
          </section>

          <section
            ref={setSectionRef('targets')}
            data-section="targets"
            className="scroll-mt-24 space-y-4 lg:scroll-mt-28"
          >
            <AdminSectionCard
              eyebrow="Pipeline"
              title="Hedef Markalar"
              description="Marka listesini daha okunaklı satır düzeninde yönet."
              actions={(
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
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
              )}
            >
              <TargetsEditor
                data={periodData.targets}
                onChange={(next) =>
                  patchPeriod((data) => ({
                    ...data,
                    targets: next,
                  }))
                }
              />
            </AdminSectionCard>
          </section>

          <section
            ref={setSectionRef('team')}
            data-section="team"
            className="scroll-mt-24 space-y-4 lg:scroll-mt-28"
          >
            <AdminSectionCard
              eyebrow="Takım"
              title="Takım Performansı"
              description="CSV içe aktarma, ağırlık yönetimi ve süre düzenlemeleri tek akışta."
            >
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
            </AdminSectionCard>
          </section>

          <section
            ref={setSectionRef('cohort')}
            data-section="cohort"
            className="scroll-mt-24 space-y-4 lg:scroll-mt-28"
          >
            <AdminSectionCard
              eyebrow="Gelişmiş"
              title="Cohort Verisi"
              description="Isı haritası verisini doğrudan hücrelerden güncelleyebilirsin."
            >
              <CohortHeatmapEditor
                data={periodData.cohort}
                onChange={(nextCohort) =>
                  patchPeriod((data) => ({
                    ...data,
                    cohort: nextCohort,
                  }))
                }
              />
            </AdminSectionCard>
          </section>
        </div>
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
