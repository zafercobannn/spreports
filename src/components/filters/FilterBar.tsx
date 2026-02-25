import { MonthSelector } from './MonthSelector'
import { YearSelector } from './YearSelector'
import { useFilterStore } from '@/stores/filter-store'

export function FilterBar() {
  const { year, month, setYear, setMonth } = useFilterStore()

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-3 py-2">
        <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Yıl</span>
        <YearSelector value={year} onChange={setYear} />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-3 py-2">
        <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Ay</span>
        <MonthSelector value={month} onChange={setMonth} />
      </div>
    </div>
  )
}
