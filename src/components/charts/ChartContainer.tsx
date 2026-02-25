import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    <Card className={cn(className)}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          {actions}
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height }}>
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : error ? (
            <div className="flex h-full items-center justify-center text-sm text-destructive">
              Veri yüklenirken hata oluştu
            </div>
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  )
}
