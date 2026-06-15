import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSectionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  defaultOpen?: boolean
  /** Sidebar'da seçili bölümse kartı vurgular (renklendirir). */
  active?: boolean
  /** Değeri her arttığında (sidebar tıklaması) kart açılır. */
  openSignal?: number
}

export function AdminSectionCard({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  defaultOpen = false,
  active = false,
  openSignal,
  ...props
}: AdminSectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Sidebar'dan bu bölüm seçilince (openSignal artınca) kartı aç.
  useEffect(() => {
    if (!openSignal) return
    setIsOpen(true)
  }, [openSignal])

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-white/70 transition-[box-shadow,border-color,background-color] duration-200',
        active ? 'border-primary/50 ring-2 ring-primary/25' : 'border-black/8',
        isOpen && 'shadow-[0_8px_30px_-12px_rgba(18,33,39,0.15)]',
        active && 'bg-white shadow-[0_10px_34px_-12px_rgba(18,33,39,0.22)]',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/90 sm:px-6"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {eyebrow && (
              <span className="shrink-0 rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-primary">
                {eyebrow}
              </span>
            )}
            <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          </div>
          {description && !isOpen && (
            <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-black/6">
          {(description || actions) && (
            <div className="flex flex-col gap-3 border-b border-black/6 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          <div className="px-5 py-5 sm:px-6">{children}</div>
        </div>
      )}
    </div>
  )
}
