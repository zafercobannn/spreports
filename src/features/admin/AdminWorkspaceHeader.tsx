import { Link } from 'react-router-dom'
import { ArrowLeft, Download, LogOut, RotateCcw, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AdminImportControl {
  id: string
  label: string
  accept: string
  onTemplateDownload: () => void
  onFileSelect: (file: File | null) => void
}

interface AdminWorkspaceHeaderProps {
  userEmail: string
  year: number
  month: number
  months: readonly string[]
  periodKey: string
  cloudSyncEnabled: boolean
  cloudStatusLabel: string
  cloudStatusVariant: 'outline' | 'success' | 'warning' | 'destructive'
  lastSavedAtLabel: string
  syncError?: string | null
  onYearChange: (value: number) => void
  onMonthChange: (value: number) => void
  onSaveNow: () => void
  onSignOut: () => void
  onResetPeriod: () => void
  onResetAll: () => void
  isSaving: boolean
  importControls: AdminImportControl[]
}

const controlInputClassName =
  'h-10 rounded-xl border border-border/75 bg-white/82 px-3 text-sm text-foreground outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-primary/15'

export function AdminWorkspaceHeader({
  userEmail,
  year,
  month,
  months,
  periodKey,
  cloudSyncEnabled,
  cloudStatusLabel,
  cloudStatusVariant,
  lastSavedAtLabel,
  syncError,
  onYearChange,
  onMonthChange,
  onSaveNow,
  onSignOut,
  onResetPeriod,
  onResetAll,
  isSaving,
  importControls,
}: AdminWorkspaceHeaderProps) {
  return (
    <Card className="overflow-hidden border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.88)_0%,rgba(229,241,244,0.88)_100%)] p-5 shadow-[0_26px_70px_-52px_rgba(23,48,57,0.88)] sm:p-6">
      <div className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/18 bg-white/70 px-3 py-1 text-[11px] tracking-[0.22em] uppercase">
                Admin Workspace
              </Badge>
              {userEmail && <Badge variant="outline">{userEmail}</Badge>}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Premium Onboarding Admin</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Günlük veri girişini, içe aktarmaları ve dönem kayıt durumunu tek çalışma alanından yönet.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Yıl</span>
              <input
                type="number"
                className={controlInputClassName}
                value={year}
                onChange={(event) => onYearChange(Number(event.target.value) || year)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Ay</span>
              <select
                className={controlInputClassName}
                value={month}
                onChange={(event) => onMonthChange(Number(event.target.value))}
              >
                {months.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-border/65 bg-white/78 px-4 py-3 sm:col-span-2 xl:col-span-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={cloudSyncEnabled ? 'success' : 'warning'}>
                  {cloudSyncEnabled ? 'Firebase Sync Aktif' : 'Local Fallback'}
                </Badge>
                <Badge variant={cloudStatusVariant}>{cloudStatusLabel}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{periodKey}</p>
              <p className="mt-1 text-xs text-muted-foreground">Son başarılı kayıt: {lastSavedAtLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onSaveNow} disabled={isSaving || !cloudSyncEnabled}>
            <Upload className="mr-2 h-4 w-4" />
            {isSaving ? 'Kaydediliyor' : 'Şimdi Kaydet'}
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış
          </Button>
          <Button variant="outline" size="sm" onClick={onResetPeriod}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Bu Dönemi Sıfırla
          </Button>
          <Button variant="destructive" size="sm" onClick={onResetAll}>
            Tüm Veriyi Sıfırla
          </Button>
        </div>

        {syncError && (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            Son senkron hatası: <span className="font-medium">{syncError}</span>
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
          {importControls.map((control) => (
            <div key={control.id} className="rounded-2xl border border-white/80 bg-white/72 p-4 shadow-[0_18px_30px_-28px_rgba(23,48,57,0.72)]">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{control.label}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={control.onTemplateDownload}>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Şablon
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border/75 bg-white px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted/35">
                  <Upload className="h-3.5 w-3.5" />
                  Yükle
                  <input
                    type="file"
                    accept={control.accept}
                    className="hidden"
                    onChange={(event) => {
                      control.onFileSelect(event.target.files?.[0] ?? null)
                      event.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
