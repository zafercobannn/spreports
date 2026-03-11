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
    <Card className="border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,249,251,0.88)_100%)] px-4 py-3 shadow-[0_24px_40px_-34px_rgba(23,48,57,0.7)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={cloudSyncEnabled ? 'success' : 'warning'}>
              {cloudSyncEnabled ? 'Firebase Sync Aktif' : 'Local Fallback'}
            </Badge>
            <Badge variant={cloudStatusVariant}>{cloudStatusLabel}</Badge>
          </div>
          <p className="text-sm font-medium text-foreground">Veritabanı Senkronu</p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
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
