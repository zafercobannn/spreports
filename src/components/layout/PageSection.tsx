import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: PageSectionProps) {
  return (
    <section className={cn('mb-8 fade-up', className)} {...props}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-wide text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </section>
  )
}
