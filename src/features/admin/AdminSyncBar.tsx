import { Badge } from '@/components/ui/badge'

interface AdminSyncBarProps {
  cloudStatusLabel: string
  cloudStatusVariant: 'outline' | 'success' | 'warning' | 'destructive'
  cloudSyncEnabled: boolean
  lastSavedAtLabel: string
  periodKey: string
  syncError?: string | null
}

export function AdminSyncBar({
  cloudStatusLabel,
  cloudStatusVariant,
  cloudSyncEnabled,
  lastSavedAtLabel,
  periodKey,
  syncError,
}: AdminSyncBarProps) {
  return (
    <div className="rounded-xl border border-black/8 bg-white/80 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={cloudSyncEnabled ? 'success' : 'warning'} className="text-[10px]">
            {cloudSyncEnabled ? 'Firebase Sync' : 'Local'}
          </Badge>
          <Badge variant={cloudStatusVariant} className="text-[10px]">{cloudStatusLabel}</Badge>
          <span className="text-[11px] text-muted-foreground">Dönem: <span className="font-medium text-foreground">{periodKey}</span></span>
        </div>

        <span className="text-[11px] text-muted-foreground">
          Son kayıt: <span className="font-medium text-foreground">{lastSavedAtLabel}</span>
        </span>
      </div>

      {syncError && (
        <p className="mt-2 text-xs text-destructive">
          Hata: <span className="font-medium">{syncError}</span>
        </p>
      )}
    </div>
  )
}
