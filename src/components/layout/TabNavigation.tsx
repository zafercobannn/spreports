import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DashboardTab } from '@/types/filters'
import {
  BarChart3,
  Grid3X3,
  Trophy,
  Target,
  Users,
} from 'lucide-react'

interface TabNavigationProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const TABS: { id: DashboardTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'monthly', label: 'Aylık Bakış', icon: BarChart3 },
  { id: 'cohort', label: 'Cohort Analizi', icon: Grid3X3 },
  { id: 'top-firms', label: 'Top 15 Firma', icon: Trophy },
  { id: 'targets', label: 'Hedef Takip', icon: Target },
  { id: 'team', label: 'Ekip Performans', icon: Users },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <TabsList className="w-full justify-start gap-1.5 overflow-x-auto">
      {TABS.map(({ id, label, icon: Icon }) => (
        <TabsTrigger
          key={id}
          active={activeTab === id}
          onClick={() => onTabChange(id)}
          className="shrink-0"
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}
