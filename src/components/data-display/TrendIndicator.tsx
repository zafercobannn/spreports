import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrendDirection } from '@/utils/calculations'

interface TrendIndicatorProps {
  value: number
  direction: TrendDirection
  isPositiveGood?: boolean
  size?: 'sm' | 'md'
}

export function TrendIndicator({
  value,
  direction,
  isPositiveGood = true,
  size = 'sm',
}: TrendIndicatorProps) {
  const isGood =
    direction === 'flat'
      ? true
      : isPositiveGood
        ? direction === 'up'
        : direction === 'down'

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  const Icon =
    direction === 'up'
      ? TrendingUp
      : direction === 'down'
        ? TrendingDown
        : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        textSize,
        isGood ? 'text-green-600' : 'text-red-600',
        direction === 'flat' && 'text-muted-foreground',
      )}
    >
      <Icon className={iconSize} />
      {direction !== 'flat' && (
        <span>{value > 0 ? '+' : ''}{value.toFixed(1)}%</span>
      )}
    </span>
  )
}
