import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

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
    <Card className="rounded-[1.6rem] border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(247,252,251,0.82)_100%)] px-4 py-3 shadow-[0_22px_34px_-30px_rgba(18,33,39,0.3)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={cloudSyncEnabled ? 'success' : 'warning'}>
              {cloudSyncEnabled ? 'Firebase Sync Aktif' : 'Local Fallback'}
            </Badge>
            <Badge variant={cloudStatusVariant}>{cloudStatusLabel}</Badge>
          </div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">Veritabanı Senkronu</p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-5">
          <span>Dönem: <span className="font-medium text-foreground">{periodKey}</span></span>
          <span>Son başarılı kayıt: <span className="font-medium text-foreground">{lastSavedAtLabel}</span></span>
        </div>
      </div>

      {syncError && (
        <p className="mt-3 text-sm text-destructive">
          Son hata: <span className="font-medium">{syncError}</span>
        </p>
      )}
    </Card>
  )
}
