import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/charts/Sparkline'
import { TrendChip } from './TrendChip'
import { useCountUp } from '@/hooks/use-count-up'
import type { TrendDirection } from '@/utils/calculations'
import type { ReactNode } from 'react'

interface KPICardProps {
  label: string
  value: string | ReactNode
  /** When provided, animates from 0 to this number on mount and uses formatValue to render. */
  numericValue?: number
  formatValue?: (n: number) => string
  unit?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: TrendDirection
    isPositiveGood?: boolean
  }
  subtitle?: ReactNode
  spark?: number[]
  className?: string
  variant?: 'default' | 'ink' | 'accent'
  size?: 'default' | 'hero'
}

export function KPICard({
  label,
  value,
  numericValue,
  formatValue,
  unit,
  icon,
  trend,
  subtitle,
  spark,
  className,
  variant = 'default',
  size = 'default',
}: KPICardProps) {
  const isInk = variant === 'ink'
  const isAccent = variant === 'accent'
  const isHero = size === 'hero'

  const animated = useCountUp(numericValue ?? 0, { duration: 1000 })
  const animatedDisplay =
    numericValue !== undefined && formatValue ? formatValue(animated) : null

  return (
    <div
      className={cn(
        'bento-card relative h-full p-5',
        isInk && 'bento-card-ink',
        isAccent && 'bento-card-yellow',
        isHero && 'p-6',
        className,
      )}
    >
      {isInk && (
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)',
          }}
        />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.10em]',
            isInk
              ? 'text-[var(--color-ink-foreground)]/55'
              : isAccent
                ? 'text-foreground/65'
                : 'text-muted-foreground',
          )}
        >
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              isInk
                ? 'bg-white/10 text-[var(--color-ink-foreground)]'
                : isAccent
                  ? 'bg-foreground/10 text-foreground'
                  : 'bg-surface-muted text-muted-foreground',
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className={cn(
          'relative font-mono tabular font-semibold leading-none tracking-[-0.025em]',
          isInk ? 'text-[var(--color-ink-foreground)]' : 'text-foreground',
          isHero ? 'mt-3 text-[34px]' : 'mt-3 text-[26px]',
        )}
      >
        {animatedDisplay ?? value}
        {unit && (
          <span
            className={cn(
              'ml-1.5 font-sans text-[14px] font-normal tracking-normal',
              isInk
                ? 'text-[var(--color-ink-foreground)]/60'
                : 'text-muted-foreground',
            )}
          >
            {unit}
          </span>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="relative mt-2 flex items-center gap-2">
          {trend && trend.direction !== 'flat' && (
            <TrendChip value={trend.value} isPositiveGood={trend.isPositiveGood ?? true} />
          )}
          {subtitle && (
            <span
              className={cn(
                'text-[11px]',
                isInk
                  ? 'text-[var(--color-ink-foreground)]/55'
                  : 'text-subtle',
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}

      {spark && spark.length > 1 && (
        <div
          className={cn(
            'relative mt-3',
            isInk ? 'text-[var(--color-accent)]' : 'text-[var(--color-chart-3)]',
          )}
        >
          <Sparkline data={spark} width={isHero ? 320 : 240} height={isHero ? 36 : 28} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}
