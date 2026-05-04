import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import { useFilterStore } from '@/stores/filter-store'
import { TURKISH_MONTHS, getCurrentYear } from '@/utils/date-utils'

export function FilterBar() {
  const { year, month, setYear, setMonth } = useFilterStore()
  const periods = useDashboardDataStore((s) => s.periods)

  const yearOptions = useMemo(() => {
    const currentYear = getCurrentYear()
    const baseYears = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
    const dataYears = Object.keys(periods)
      .map((key) => Number(key.split('-')[0]))
      .filter((y) => Number.isFinite(y))
    return Array.from(new Set([...baseYears, ...dataYears]))
      .sort((a, b) => a - b)
      .map((y) => ({ value: y, label: String(y) }))
  }, [periods])

  const monthOptions = useMemo(
    () => TURKISH_MONTHS.map((label, idx) => ({ value: idx + 1, label })),
    [],
  )

  return (
    <div className="flex items-center gap-1.5">
      <SearchableSelect
        value={year}
        onChange={(v) => setYear(Number(v))}
        options={yearOptions}
        align="right"
        renderTrigger={(selected) => (
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono">{selected?.label ?? '—'}</span>
          </span>
        )}
      />
      <SearchableSelect
        value={month}
        onChange={(v) => setMonth(Number(v))}
        options={monthOptions}
        align="right"
        renderTrigger={(selected) => (
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{selected?.label ?? '—'}</span>
          </span>
        )}
      />
    </div>
  )
}
