import { Link } from 'react-router-dom'
import { Bell, GitCompareArrows, LogOut, Moon, Presentation, Settings, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/filters/FilterBar'
import { useTheme } from '@/hooks/use-theme'
import { useFilters } from '@/hooks/use-filters'
import { getMonthName } from '@/utils/date-utils'
import type { DashboardTab } from '@/types/filters'
import { cn } from '@/lib/utils'

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'monthly', label: 'Aylık' },
  { id: 'comparison', label: 'Karşılaştırma' },
  { id: 'top-firms', label: 'Top Firma' },
  { id: 'cohort', label: 'Cohort' },
  { id: 'realized-targets', label: 'Hedef' },
  { id: 'team', label: 'Ekip' },
  { id: 'x-month-target', label: 'Sonraki Ay' },
]

const TAB_LABELS: Record<DashboardTab, string> = {
  monthly: 'Aylık Bakış',
  comparison: 'Önceki Ay Karşılaştırma',
  cohort: 'Cohort Analizi',
  'top-firms': 'Top 15 Firma',
  'realized-targets': 'Gerçekleşen Hedef',
  'x-month-target': 'Bir Sonraki Ay Hedef',
  team: 'Ekip Performansı',
}

interface DashboardHeaderProps {
  isAdmin: boolean
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  onPresentationMode: (mode: 'slideshow' | 'narrator') => void
  userEmail?: string
  onSignOut?: () => void
}

function getInitials(email?: string): string {
  if (!email) return 'PO'
  const local = email.split('@')[0] || ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  const first = parts[0]?.[0] ?? local[0] ?? 'P'
  const second = parts[1]?.[0] ?? local[1] ?? 'O'
  return (first + second).toUpperCase()
}

function getDisplayName(email?: string): string {
  if (!email) return 'Premium Onboarding'
  const local = email.split('@')[0] || ''
  const part = local.split(/[._-]+/).filter(Boolean)[0] ?? local
  return part.charAt(0).toUpperCase() + part.slice(1)
}

export function DashboardHeader({
  isAdmin,
  activeTab,
  onTabChange,
  onPresentationMode,
  userEmail,
  onSignOut,
}: DashboardHeaderProps) {
  const { theme, toggle } = useTheme()
  const { year, month } = useFilters()
  const monthLabel = `${getMonthName(month)} ${year}`
  const initials = getInitials(userEmail)
  const displayName = getDisplayName(userEmail)
  const tabLabel = TAB_LABELS[activeTab]

  return (
    <header className="relative z-30 space-y-6 px-7 pt-6">
      {/* Top pill nav */}
      <div className="fade-up flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-full border border-border-strong bg-surface px-5 py-2.5 text-[15px] font-semibold tracking-tight">
            SP Reports
          </div>
        </div>

        <nav className="flex items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-surface/70 px-1.5 py-1.5 backdrop-blur-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={cn('nav-pill', activeTab === tab.id && 'active')}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="default" className="rounded-full" onClick={toggle} aria-label="Tema">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to="/admin">
            <Button variant="secondary" size="default" className="rounded-full" aria-label={isAdmin ? 'Admin' : 'Yönetici girişi'}>
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">{isAdmin ? 'Admin' : 'Giriş'}</span>
            </Button>
          </Link>
          <Button variant="secondary" size="icon" className="relative rounded-full" aria-label="Bildirim">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          </Button>
          {onSignOut && (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onSignOut} aria-label="Çıkış">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          {userEmail && (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #1a1a1d, #555)' }}
              title={userEmail}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Slim hero row — title + meta + filter + actions in one band */}
      <div className="fade-up fade-up-d1 flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {tabLabel}
          </p>
          <h1 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[42px]">
            {isAdmin ? `Hoş geldin, ${displayName}` : displayName}
            <span className="ml-3 inline-block align-middle text-[14px] font-medium text-muted-foreground">
              · {monthLabel}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterBar />
          {activeTab === 'team' && (
            <Button
              variant="secondary"
              size="default"
              className="rounded-full"
              onClick={() => {
                document
                  .getElementById('rep-compare-section')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <GitCompareArrows className="h-4 w-4" />
              Karşılaştır
            </Button>
          )}
          <Button size="default" className="rounded-full" onClick={() => onPresentationMode('slideshow')}>
            <Presentation className="h-4 w-4" />
            Sunum
          </Button>
          <Button variant="secondary" size="default" className="rounded-full" onClick={() => onPresentationMode('narrator')}>
            <Presentation className="h-4 w-4" />
            Anlatıcı
          </Button>
        </div>
      </div>
    </header>
  )
}
