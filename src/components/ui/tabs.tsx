import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full', className)} {...props} />
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-2xl border border-border/70 bg-white/70 p-1.5 text-muted-foreground backdrop-blur-sm',
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
        'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'bg-white text-foreground shadow-[0_8px_20px_-14px_rgba(23,48,57,0.85)]'
          : 'text-muted-foreground hover:bg-white/70 hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  )
}
