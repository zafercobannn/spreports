import { Badge } from '@/components/ui/badge'

interface AdminHeroPanelProps {
  periodLabel: string
  userEmail: string
}

export function AdminHeroPanel({
  periodLabel,
  userEmail,
}: AdminHeroPanelProps) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white/60 px-6 py-5 sm:px-8 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-black/10 bg-white/70 px-2.5 py-0.5 text-[11px] tracking-wide uppercase text-foreground">
              Premium Onboarding
            </Badge>
            <Badge variant="outline" className="border-primary/20 bg-primary/8 text-primary">
              {periodLabel}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Veri Yönetim Paneli
          </h1>
        </div>

        {userEmail && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{userEmail}</span>
          </p>
        )}
      </div>
    </div>
  )
}
