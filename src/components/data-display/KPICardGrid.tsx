import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface KPICardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4
}

export function KPICardGrid({ columns = 4, className, ...props }: KPICardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)} {...props} />
  )
}
