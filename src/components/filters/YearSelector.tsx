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
      className="cursor-pointer appearance-none bg-transparent font-mono text-[12px] font-medium text-foreground outline-none"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {years.map((year) => (
        <option key={year} value={year} className="bg-surface text-foreground">
          {year}
        </option>
      ))}
    </select>
  )
}
