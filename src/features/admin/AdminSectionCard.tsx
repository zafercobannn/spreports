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
        'overflow-hidden rounded-[2rem] border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(249,252,251,0.8)_100%)] shadow-[0_24px_70px_-60px_rgba(18,33,39,0.4)]',
        className,
      )}
      {...props}
    >
      <div className="border-b border-black/8 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            {eyebrow && (
              <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                {eyebrow}
              </p>
            )}
            <div className="space-y-1">
              <h2 className="text-[1.8rem] leading-none font-medium tracking-[-0.04em] text-foreground">{title}</h2>
              {description && <p className="max-w-2xl text-[15px] leading-6 text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
      <div className="px-5 py-6 sm:px-7">{children}</div>
    </Card>
  )
}
