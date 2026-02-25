import { TURKISH_MONTHS } from '@/utils/date-utils'

interface MonthSelectorProps {
  value: number
  onChange: (month: number) => void
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  return (
    <select
      className="h-9 min-w-36 rounded-full border border-border/70 bg-white/80 px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {TURKISH_MONTHS.map((name, idx) => (
        <option key={name} value={idx + 1}>
          {name}
        </option>
      ))}
    </select>
  )
}
