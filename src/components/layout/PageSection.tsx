import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string
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
    <section className={cn('space-y-4', className)} {...props}>
      {(title || description || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            {title && (
              <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.015em] text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[12.5px] text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
