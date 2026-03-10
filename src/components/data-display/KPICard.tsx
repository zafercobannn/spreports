import { Card, CardContent } from '@/components/ui/card'
import { TrendIndicator } from './TrendIndicator'
import { cn } from '@/lib/utils'
import type { TrendDirection } from '@/utils/calculations'
import type { ReactNode } from 'react'

interface KPICardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: TrendDirection
    isPositiveGood?: boolean
  }
  subtitle?: ReactNode
  className?: string
}

export function KPICard({
  label,
  value,
  icon,
  trend,
  subtitle,
  className,
}: KPICardProps) {
  const hasIkasLabel = /\bikas\b/i.test(label)

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn(
              'text-[11px] font-semibold text-muted-foreground tracking-[0.11em]',
              hasIkasLabel ? 'normal-case' : 'uppercase',
            )}>
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {typeof subtitle === 'string'
              ? <p className="text-xs text-muted-foreground">{subtitle}</p>
              : subtitle}
          </div>
          {icon && (
            <div className="rounded-xl border border-white/80 bg-white/70 p-2 text-muted-foreground shadow-[0_10px_20px_-16px_rgba(23,48,57,0.7)]">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-2">
            <TrendIndicator
              value={trend.value}
              direction={trend.direction}
              isPositiveGood={trend.isPositiveGood}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
