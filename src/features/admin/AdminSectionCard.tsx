import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AdminSectionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
}

export function AdminSectionCard({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  ...props
}: AdminSectionCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(247,252,253,0.82)_100%)] shadow-[0_28px_70px_-56px_rgba(23,48,57,0.9)]',
        className,
      )}
      {...props}
    >
      <div className="border-b border-border/55 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            {eyebrow && (
              <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {eyebrow}
              </p>
            )}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
              {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </Card>
  )
}
