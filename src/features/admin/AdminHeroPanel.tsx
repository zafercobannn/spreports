import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface AdminHeroPanelProps {
  activeSectionLabel: string
  periodLabel: string
  userEmail: string
}

export function AdminHeroPanel({
  activeSectionLabel,
  periodLabel,
  userEmail,
}: AdminHeroPanelProps) {
  return (
    <Card className="relative overflow-hidden border-black/10 bg-[linear-gradient(135deg,rgba(241,249,243,0.94)_0%,rgba(237,247,248,0.9)_48%,rgba(232,244,247,0.94)_100%)] p-6 shadow-[0_26px_80px_-62px_rgba(18,33,39,0.55)] sm:p-8">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block">
        <div className="absolute right-[-8%] top-[-10%] h-[78%] w-[82%] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(114,215,255,0.85),rgba(114,215,255,0.08)_46%,transparent_70%)] blur-2xl" />
        <div className="absolute bottom-[-8%] right-[6%] h-[62%] w-[58%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,193,164,0.5),rgba(0,193,164,0.06)_50%,transparent_72%)] blur-2xl" />
        <div className="absolute right-[12%] top-[8%] h-[72%] w-[70%] rounded-[38%] border border-white/35 bg-[linear-gradient(160deg,rgba(255,255,255,0.55),rgba(148,221,245,0.18)_42%,rgba(255,183,212,0.18)_100%)] opacity-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl" />
        <div className="absolute right-[24%] top-[18%] h-[36%] w-[28%] rounded-[42%] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(170,234,247,0.15))] opacity-90 backdrop-blur-md" />
        <div className="absolute bottom-[12%] right-[18%] h-[18%] w-[32%] rounded-full border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,193,225,0.24))] opacity-90 backdrop-blur-md" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] lg:items-end">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-black/12 bg-white/55 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-foreground">
              Operational Canvas
            </Badge>
            <Badge variant="outline" className="border-black/12 bg-white/55 text-foreground">
              {periodLabel}
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-2xl text-4xl leading-[0.98] font-medium tracking-[-0.05em] text-foreground sm:text-5xl lg:text-[4.2rem]">
              Dashboard verisini daha sakin bir yüzeyden yönet.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Seçili dönem için veri girişini soldan yönlendir, düzenlemeleri sağdaki tek çalışma yüzeyinden tamamla.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-black/10 bg-black/10">
            <div className="bg-white/54 p-5 backdrop-blur-md">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">Aktif Bölüm</p>
              <p className="mt-3 text-3xl font-medium tracking-tight text-foreground">{activeSectionLabel}</p>
            </div>
            <div className="bg-white/48 p-5 backdrop-blur-md">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">Operasyon Notu</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-foreground/80">
                İçe aktarmalar, dönem seçimi ve bölüm geçişleri artık tek rail üzerinde. Sağ alan sadece çalışmaya ayrıldı.
              </p>
              {userEmail && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Oturum: <span className="font-medium text-foreground">{userEmail}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
