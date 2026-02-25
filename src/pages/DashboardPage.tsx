import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { TabNavigation } from '@/components/layout/TabNavigation'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { MonthlyOverviewTab } from '@/features/monthly-overview/MonthlyOverviewTab'
import { CohortTab } from '@/features/cohort/CohortTab'
import { TopFirmsTab } from '@/features/top-firms/TopFirmsTab'
import { TargetsTab } from '@/features/targets/TargetsTab'
import { TeamPerformanceTab } from '@/features/team-performance/TeamPerformanceTab'
import { PresentationMode } from '@/features/presentation/PresentationMode'
import { usePresentationStore } from '@/stores/presentation-store'
import type { DashboardTab } from '@/types/filters'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('monthly')
  const enterPresentation = usePresentationStore((s) => s.enterPresentation)

  return (
    <DashboardLayout>
      <DashboardHeader onPresentationMode={enterPresentation} />

      <Tabs className="fade-up fade-up-delay-2">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'monthly' && (
          <TabsContent className="fade-up">
            <MonthlyOverviewTab />
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
        {activeTab === 'targets' && (
          <TabsContent className="fade-up">
            <TargetsTab />
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
