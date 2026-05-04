import { cn } from '@/lib/utils'

interface TrendChipProps {
  value: number
  isPositiveGood?: boolean
  className?: string
  showArrow?: boolean
}

export function TrendChip({ value, isPositiveGood = true, className, showArrow = false }: TrendChipProps) {
  const isPositive = value >= 0
  const isGood = isPositiveGood ? isPositive : !isPositive
  const sign = isPositive ? '+' : ''
  const arrow = isPositive ? '↑' : '↓'

  return (
    <span
      className={cn(
        'lin-chip',
        isGood
          ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
          : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
        className,
      )}
    >
      {showArrow && <span>{arrow}</span>}
      <span>{sign}{Math.abs(value).toFixed(1)}%</span>
    </span>
  )
}
