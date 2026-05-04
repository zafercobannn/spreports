import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1480px]">
        {children}
      </div>
    </div>
  )
}
