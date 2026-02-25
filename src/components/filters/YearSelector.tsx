import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import { getCurrentYear } from '@/utils/date-utils'
import { useMemo } from 'react'

interface YearSelectorProps {
  value: number
  onChange: (year: number) => void
}

export function YearSelector({ value, onChange }: YearSelectorProps) {
  const periods = useDashboardDataStore((s) => s.periods)
  const availablePeriodKeys = useMemo(() => Object.keys(periods), [periods])

  const years = useMemo(() => {
    const currentYear = getCurrentYear()
    const baseYears = [
      currentYear - 3,
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
    ]
    const dataYears = availablePeriodKeys
      .map((key) => Number(key.split('-')[0]))
      .filter((year) => Number.isFinite(year))

    return Array.from(new Set([...baseYears, ...dataYears])).sort((a, b) => a - b)
  }, [availablePeriodKeys])

  return (
    <select
      className="h-9 min-w-28 rounded-full border border-border/70 bg-white/80 px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}
