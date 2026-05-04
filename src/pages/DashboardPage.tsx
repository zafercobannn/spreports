import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { useAdminAuth } from '@/features/auth/AdminAuthProvider'
import { MonthlyOverviewTab } from '@/features/monthly-overview/MonthlyOverviewTab'
import { MonthlyComparisonTab } from '@/features/monthly-comparison/MonthlyComparisonTab'
import { CohortTab } from '@/features/cohort/CohortTab'
import { TopFirmsTab } from '@/features/top-firms/TopFirmsTab'
import { RealizedTargetsTab } from '@/features/targets/RealizedTargetsTab'
import { XMonthTargetTab } from '@/features/targets/XMonthTargetTab'
import { TeamPerformanceTab } from '@/features/team-performance/TeamPerformanceTab'
import { PresentationMode } from '@/features/presentation/PresentationMode'
import { usePresentationStore } from '@/stores/presentation-store'
import type { DashboardTab } from '@/types/filters'

function DashboardWorkspace() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('monthly')
  const enterPresentation = usePresentationStore((s) => s.enterPresentation)
  const { isAdmin, signOut, userEmail } = useAdminAuth()

  return (
    <DashboardLayout>
      <DashboardHeader
        isAdmin={isAdmin}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPresentationMode={enterPresentation}
        userEmail={isAdmin ? userEmail : ''}
        onSignOut={
          isAdmin
            ? () => {
                void signOut()
              }
            : undefined
        }
      />

      <div className="px-7 pb-12 pt-7">
        {activeTab === 'monthly' && <MonthlyOverviewTab />}
        {activeTab === 'comparison' && <MonthlyComparisonTab />}
        {activeTab === 'cohort' && <CohortTab />}
        {activeTab === 'top-firms' && <TopFirmsTab />}
        {activeTab === 'realized-targets' && <RealizedTargetsTab />}
        {activeTab === 'x-month-target' && <XMonthTargetTab />}
        {activeTab === 'team' && <TeamPerformanceTab />}
      </div>

      <PresentationMode />
    </DashboardLayout>
  )
}

export function DashboardPage() {
  return <DashboardWorkspace />
}
