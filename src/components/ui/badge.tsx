import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-[4px] border px-1.5 py-[2px] text-[10px] font-semibold tracking-[0.02em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-muted text-muted-foreground',
        secondary: 'border-border bg-surface-muted text-muted-foreground',
        destructive: 'border-transparent bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
        outline: 'border-border bg-transparent text-muted-foreground',
        success: 'border-transparent bg-[var(--color-success-soft)] text-[var(--color-success)]',
        warning: 'border-transparent bg-amber-500/10 text-amber-700',
        accent: 'border-border bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
