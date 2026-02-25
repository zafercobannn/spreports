import { Link } from 'react-router-dom'
import { Presentation, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/filters/FilterBar'

interface DashboardHeaderProps {
  onPresentationMode: (mode: 'slideshow' | 'narrator') => void
}

export function DashboardHeader({ onPresentationMode }: DashboardHeaderProps) {
  return (
    <header className="mb-7 space-y-4">
      <div className="fade-up rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_14px_38px_-30px_rgba(23,48,57,0.7)] backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Premium Onboarding</h1>
              <p className="text-sm text-muted-foreground">Aylık Performans Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              onClick={() => onPresentationMode('slideshow')}
            >
              <Presentation className="mr-2 h-4 w-4" />
              Sunum
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPresentationMode('narrator')}
            >
              <Presentation className="mr-2 h-4 w-4" />
              Anlatıcı
            </Button>
          </div>
        </div>
      </div>

      <div className="fade-up fade-up-delay-1 rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur-sm">
        <FilterBar />
      </div>
    </header>
  )
}
