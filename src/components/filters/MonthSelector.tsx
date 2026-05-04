import { TURKISH_MONTHS } from '@/utils/date-utils'

interface MonthSelectorProps {
  value: number
  onChange: (month: number) => void
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  return (
    <select
      className="cursor-pointer appearance-none bg-transparent text-[12px] font-medium text-foreground outline-none"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {TURKISH_MONTHS.map((name, idx) => (
        <option key={name} value={idx + 1} className="bg-surface text-foreground">
          {name}
        </option>
      ))}
    </select>
  )
}
