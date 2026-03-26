import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { TabNavigation } from '@/components/layout/TabNavigation'
import { Tabs, TabsContent } from '@/components/ui/tabs'
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

      <Tabs className="fade-up fade-up-delay-2">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'monthly' && (
          <TabsContent className="fade-up">
            <MonthlyOverviewTab />
          </TabsContent>
        )}
        {activeTab === 'comparison' && (
          <TabsContent className="fade-up">
            <MonthlyComparisonTab />
          </TabsContent>
        )}
        {activeTab === 'cohort' && (
          <TabsContent className="fade-up">
            <CohortTab />
          </TabsContent>
        )}
        {activeTab === 'top-firms' && (
          <TabsContent className="fade-up">
            <TopFirmsTab />
          </TabsContent>
        )}
        {activeTab === 'realized-targets' && (
          <TabsContent className="fade-up">
            <RealizedTargetsTab />
          </TabsContent>
        )}
        {activeTab === 'x-month-target' && (
          <TabsContent className="fade-up">
            <XMonthTargetTab />
          </TabsContent>
        )}
        {activeTab === 'team' && (
          <TabsContent className="fade-up">
            <TeamPerformanceTab />
          </TabsContent>
        )}
      </Tabs>

      <PresentationMode />
    </DashboardLayout>
  )
}

export function DashboardPage() {
  return <DashboardWorkspace />
}
