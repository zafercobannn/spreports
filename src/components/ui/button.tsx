import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-[12px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-foreground text-background hover:bg-foreground/90',
        secondary:
          'border-border bg-surface text-foreground hover:bg-hover',
        outline:
          'border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-hover',
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:text-foreground hover:bg-hover',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-8 px-2.5 py-1',
        sm: 'h-7 px-2.5 text-[11.5px]',
        lg: 'h-9 px-4 text-[12.5px]',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'default',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
