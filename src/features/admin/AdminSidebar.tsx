import { Link } from 'react-router-dom'
import { ArrowLeft, Download, LogOut, RotateCcw, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  'h-9 w-full rounded-lg border border-black/10 bg-white px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'

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
    <div className="space-y-1 rounded-2xl border border-black/8 bg-white/70">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs font-semibold tracking-wide uppercase text-primary">Premium Ops</p>
        {userEmail && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{userEmail}</p>}
      </div>

      {/* Period selector */}
      <div className="border-t border-black/6 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Dönem</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Yıl</span>
            <input
              type="number"
              className={controlInputClassName}
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value) || year)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Ay</span>
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
      </div>

      {/* Sections - desktop */}
      <div className="border-t border-black/6 px-4 py-3">
        <div className="lg:hidden">
          <AdminSectionChips items={sections} activeId={activeSection} onSelect={onSelectSection} />
        </div>
        <div className="hidden lg:block">
          <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Bölümler</p>
          <div className="space-y-1">
            {sections.map((section) => {
              const isActive = section.id === activeSection
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  className={cn(
                    'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-black/4',
                  )}
                >
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-black/6 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Aksiyonlar</p>
        <div className="space-y-1">
          <Button size="sm" className="w-full justify-start rounded-lg text-xs" onClick={onSaveNow} disabled={isSaving}>
            <Save className="mr-2 h-3.5 w-3.5" />
            {isSaving ? 'Kaydediliyor...' : 'Şimdi Kaydet'}
          </Button>
          <Link to="/dashboard" className="contents">
            <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg text-xs">
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start rounded-lg text-xs"
            onClick={() => {
              if (window.confirm('Bu döneme ait tüm veriler sıfırlanacak. Emin misiniz?')) {
                onResetPeriod()
              }
            }}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Bu Dönemi Sıfırla
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start rounded-lg text-xs text-destructive hover:text-destructive"
            onClick={() => {
              if (window.confirm('Tüm dönemlere ait veriler kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?')) {
                onResetAll()
              }
            }}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Tüm Veriyi Sıfırla
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="border-t border-black/6 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">İçe Aktarma</p>
        <div className="space-y-2">
          {importControls.map((control) => (
            <div key={control.id} className="flex items-center justify-between gap-2 rounded-lg border border-black/6 bg-white/50 px-3 py-2">
              <span className="text-xs font-medium text-foreground">{control.label}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={control.onTemplateDownload}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                  title="Şablon İndir"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <label className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground" title="Dosya Yükle">
                  <Upload className="h-3.5 w-3.5" />
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

      {/* Sign out */}
      <div className="border-t border-black/6 px-4 py-3">
        <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg text-xs text-muted-foreground" onClick={onSignOut}>
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}
