import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrendDirection } from '@/utils/calculations'

interface TrendIndicatorProps {
  value: number
  direction: TrendDirection
  isPositiveGood?: boolean
  size?: 'sm' | 'md'
  alwaysShowValue?: boolean
}

export function TrendIndicator({
  value,
  direction,
  isPositiveGood = true,
  size = 'sm',
  alwaysShowValue = false,
}: TrendIndicatorProps) {
  const isGood =
    direction === 'flat'
      ? true
      : isPositiveGood
        ? direction === 'up'
        : direction === 'down'

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[12px]'

  const Icon =
    direction === 'up'
      ? TrendingUp
      : direction === 'down'
        ? TrendingDown
        : Minus

  const showValue = alwaysShowValue || direction !== 'flat'
  const absValue = Math.abs(value)
  const formattedValue = absValue >= 1
    ? value.toFixed(1)
    : value.toFixed(2)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono tabular font-medium',
        textSize,
        isGood ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
        direction === 'flat' && 'text-muted-foreground',
      )}
    >
      <Icon className={iconSize} />
      {showValue && (
        <span>{value > 0 ? '+' : ''}{formattedValue}%</span>
      )}
    </span>
  )
}
