import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/data-display/EmptyState'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ChartContainerProps {
  title?: string
  subtitle?: string
  isLoading?: boolean
  error?: Error | null
  isEmpty?: boolean
  height?: number
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function ChartContainer({
  title,
  subtitle,
  isLoading,
  error,
  isEmpty,
  height = 300,
  children,
  actions,
  className,
}: ChartContainerProps) {
  return (
    <div className={cn('bento-card', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3">
          <div>
            {title && (
              <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                {title}
              </span>
            )}
            {subtitle && (
              <p className="mt-2 text-[12px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="px-6 pb-6">
        <div style={{ height }}>
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : error ? (
            <div className="flex h-full items-center justify-center text-[12px] text-[var(--color-danger)]">
              Veri yüklenirken hata oluştu
            </div>
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
