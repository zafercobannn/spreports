import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full', className)} {...props} />
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 overflow-x-auto border-b border-border px-7 pb-2.5 pt-4',
        className,
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function TabsTrigger({ className, active, ...props }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-[12.5px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40',
        active
          ? 'border-border bg-surface text-foreground font-medium shadow-[0_1px_0_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.4)]'
          : 'border-transparent bg-transparent text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-7 pb-10 pt-5 ring-offset-background focus-visible:outline-none', className)}
      {...props}
    />
  )
}
