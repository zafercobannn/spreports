import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(42,99,115,0.25)_0%,transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(61,141,134,0.2)_0%,transparent_70%)] blur-2xl" />

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="surface-shell soft-grid p-5 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
