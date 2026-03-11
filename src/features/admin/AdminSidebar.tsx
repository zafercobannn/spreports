import { Link } from 'react-router-dom'
import { ArrowLeft, Download, LogOut, RotateCcw, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AdminSectionChips } from '@/features/admin/AdminSectionChips'

interface AdminSectionItem {
  id: string
  label: string
}

interface AdminImportControl {
  id: string
  label: string
  accept: string
  onTemplateDownload: () => void
  onFileSelect: (file: File | null) => void
}

interface AdminSidebarProps {
  activeSection: string
  importControls: AdminImportControl[]
  isSaving: boolean
  months: readonly string[]
  onMonthChange: (value: number) => void
  onResetAll: () => void
  onResetPeriod: () => void
  onSaveNow: () => void
  onSelectSection: (id: string) => void
  onSignOut: () => void
  onYearChange: (value: number) => void
  sections: readonly AdminSectionItem[]
  userEmail: string
  year: number
  month: number
}

const controlInputClassName =
  'h-10 rounded-xl border border-border/75 bg-white/85 px-3 text-sm text-foreground outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-primary/15'

export function AdminSidebar({
  activeSection,
  importControls,
  isSaving,
  months,
  onMonthChange,
  onResetAll,
  onResetPeriod,
  onSaveNow,
  onSelectSection,
  onSignOut,
  onYearChange,
  sections,
  userEmail,
  year,
  month,
}: AdminSidebarProps) {
  return (
    <Card className="rounded-[2rem] border-black/10 bg-[linear-gradient(180deg,rgba(240,248,241,0.94)_0%,rgba(245,250,248,0.86)_100%)] p-4 shadow-[0_26px_70px_-58px_rgba(18,33,39,0.42)] sm:p-5">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-black/10 bg-white/55 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-foreground">
              Premium Ops
            </Badge>
            {userEmail && <Badge variant="outline" className="border-black/10 bg-white/55 text-foreground">{userEmail}</Badge>}
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-black/8 bg-white/44 p-3 sm:grid-cols-2 lg:grid-cols-1">
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
        </div>

        <div className="space-y-3 border-t border-black/8 pt-5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Aksiyonlar</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Button className="justify-start rounded-full" onClick={onSaveNow} disabled={isSaving}>
              <Upload className="mr-2 h-4 w-4" />
              {isSaving ? 'Kaydediliyor' : 'Şimdi Kaydet'}
            </Button>
            <Link to="/dashboard" className="contents">
              <Button variant="outline" className="justify-start rounded-full border-black/10 bg-white/55">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" className="justify-start rounded-full" onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış
            </Button>
            <Button variant="outline" className="justify-start rounded-full border-black/10 bg-white/55" onClick={onResetPeriod}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Bu Dönemi Sıfırla
            </Button>
            <Button variant="destructive" className="justify-start rounded-full" onClick={onResetAll}>
              Tüm Veriyi Sıfırla
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-t border-black/8 pt-5">
          <div className="lg:hidden">
            <AdminSectionChips items={sections} activeId={activeSection} onSelect={onSelectSection} />
          </div>
          <div className="hidden lg:block">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Bölümler</p>
            <div className="space-y-2">
              {sections.map((section) => {
                const isActive = section.id === activeSection
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelectSection(section.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'border-primary/20 bg-primary text-primary-foreground shadow-[0_16px_28px_-22px_rgba(42,99,115,0.42)]'
                        : 'border-black/8 bg-white/44 text-foreground hover:border-primary/16 hover:bg-white/70',
                    )}
                  >
                    <span>{section.label}</span>
                    <span className="text-xs opacity-70">Git</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-black/8 pt-5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">İçe Aktarma</p>
          <div className="grid gap-3">
            {importControls.map((control) => (
              <div key={control.id} className="rounded-[1.4rem] border border-black/8 bg-white/44 p-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-foreground">{control.label}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-full border-black/10 bg-white/55" onClick={control.onTemplateDownload}>
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Şablon
                  </Button>
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-black/10 bg-white/55 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-white/80">
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
      </div>
    </Card>
  )
}
