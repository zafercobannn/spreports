import { Calendar, ChevronDown } from 'lucide-react'
import { MonthSelector } from './MonthSelector'
import { YearSelector } from './YearSelector'
import { useFilterStore } from '@/stores/filter-store'

export function FilterBar() {
  const { year, month, setYear, setMonth } = useFilterStore()

  return (
    <div className="flex items-center gap-1.5">
      <label className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-hover">
        <Calendar className="h-3 w-3" />
        <YearSelector value={year} onChange={setYear} />
        <ChevronDown className="h-3 w-3 text-subtle" />
      </label>
      <label className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-hover">
        <Calendar className="h-3 w-3" />
        <MonthSelector value={month} onChange={setMonth} />
        <ChevronDown className="h-3 w-3 text-subtle" />
      </label>
    </div>
  )
}
