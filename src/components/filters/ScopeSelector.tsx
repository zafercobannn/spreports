import { SearchableSelect } from '@/components/ui/searchable-select'
import { cn } from '@/lib/utils'
import type { PeriodScope } from '@/hooks/use-period-scope'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const SCOPE_OPTIONS: { id: PeriodScope['scope']; label: string }[] = [
  { id: 'monthly', label: 'Aylık' },
  { id: 'quarterly', label: 'Çeyreklik' },
  { id: 'yearly', label: 'Yıllık' },
]

interface ScopeSelectorProps {
  periodScope: PeriodScope
  className?: string
}

/** Aylık/Çeyreklik/Yıllık pill seçici + gerektiğinde yıl/çeyrek dropdown'ları. */
export function ScopeSelector({ periodScope, className }: ScopeSelectorProps) {
  const { scope, setScope, selectedYear, setYearOverride, selectedQuarter, setSelectedQuarter, yearOptions } =
    periodScope

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-1">
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={cn(
              'rounded-full px-3 py-1 text-[12px] font-medium transition-colors',
              scope === opt.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setScope(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {scope !== 'monthly' && (
        <SearchableSelect
          value={selectedYear}
          onChange={(v) => setYearOverride(Number(v))}
          options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
          triggerClassName="h-8 text-[12px]"
        />
      )}

      {scope === 'quarterly' && (
        <SearchableSelect
          value={selectedQuarter}
          onChange={(v) => setSelectedQuarter(Number(v))}
          options={QUARTERS.map((q, i) => ({ value: i + 1, label: q }))}
          triggerClassName="h-8 text-[12px]"
          popoverClassName="min-w-[100px]"
        />
      )}
    </div>
  )
}
