import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import { isRepresentativeCsatPeriod } from './representative-success-utils'

interface RepresentativeSuccessAdminProps {
  data: RepresentativeSuccessRecord[]
  weights: RepresentativeSuccessWeights
  month: number
  monthLabel: string
  year: number
  onDataChange: (next: RepresentativeSuccessRecord[]) => void
  onWeightsChange: (next: RepresentativeSuccessWeights) => void
}

const inputClassName =
  'h-9 w-full min-w-0 rounded-xl border border-border/80 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

export function RepresentativeSuccessAdmin({
  data,
  weights,
  month,
  monthLabel,
  year,
  onDataChange,
  onWeightsChange,
}: RepresentativeSuccessAdminProps) {
  const usesCsatModel = isRepresentativeCsatPeriod(year, month)
  const totalWeight = weights.liveCount + weights.auditScore + (usesCsatModel ? weights.csatScore : weights.npsScore + weights.meetingScore)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-border/65 bg-white/72 p-5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">CSV Başlıkları</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {monthLabel} {year} dönemi temsilci dosyasını üst bardaki içe aktarma alanından yükleyebilirsin.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">Temsilci</Badge>
            <Badge variant="outline">Canlıya Alınan Hesap Sayısı</Badge>
            <Badge variant="outline">Canlıya Alınan Hesap Sayısı Hedefi</Badge>
            <Badge variant="outline">Audit Puan</Badge>
            <Badge variant="outline">{usesCsatModel ? 'CSAT (CALL + Toplantı Değerlendirmesi + Mail)' : 'NPS Anket Skoru'}</Badge>
            <Badge variant="outline">Ortalama Canlıya Alma Süresi (gün)</Badge>
            {!usesCsatModel && <Badge variant="outline">Toplantı Değerlendirmesi</Badge>}
            <Badge variant="outline">Görsel URL</Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-border/65 bg-white/72 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">KPI Ağırlıkları</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {usesCsatModel
                  ? 'Mart 2026 itibarıyla başarı endeksi Hedef, Audit ve CSAT dağılımıyla hesaplanır.'
                  : 'Başarı endeksi dağılımını günlük operasyon ihtiyacına göre düzenle.'}
              </p>
            </div>
            <div className="rounded-2xl border border-border/65 bg-background/65 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Toplam</p>
              <p className={`mt-1 text-2xl font-semibold ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                %{totalWeight}
              </p>
            </div>
          </div>

          <div className={`mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 ${usesCsatModel ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Canlıya Alınan Hesap</span>
              <NumberInput
                className={inputClassName}
                value={weights.liveCount}
                onValueChange={(value) => onWeightsChange({ ...weights, liveCount: Math.max(0, value) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Audit</span>
              <NumberInput
                className={inputClassName}
                value={weights.auditScore}
                onValueChange={(value) => onWeightsChange({ ...weights, auditScore: Math.max(0, value) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">{usesCsatModel ? 'CSAT' : 'NPS'}</span>
              <NumberInput
                className={inputClassName}
                value={usesCsatModel ? weights.csatScore : weights.npsScore}
                onValueChange={(value) => onWeightsChange(
                  usesCsatModel
                    ? { ...weights, csatScore: Math.max(0, value), npsScore: 0, meetingScore: 0 }
                    : { ...weights, npsScore: Math.max(0, value) },
                )}
              />
            </label>
            {!usesCsatModel && (
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Toplantı</span>
                <NumberInput
                  className={inputClassName}
                  value={weights.meetingScore}
                  onValueChange={(value) => onWeightsChange({ ...weights, meetingScore: Math.max(0, value) })}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/65 bg-white/72 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Ortalama Canlıya Alma Süresi</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Temsilci bazlı manuel süre değerlerini burada düzenleyebilirsin.
            </p>
          </div>
          <Badge variant="outline">{data.length} temsilci</Badge>
        </div>

        {data.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border/75 bg-background/45 px-4 py-6 text-sm text-muted-foreground">
            Temsilci listesi boş. CSV içe aktarmasını üst bardan yapıp ardından bu alanı düzenleyebilirsin.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="hidden grid-cols-[minmax(0,1fr)_180px_44px] gap-3 px-1 lg:grid">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Temsilci</span>
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Süre (gün)</span>
              <span />
            </div>
            {data.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-white/78 p-3 lg:grid-cols-[minmax(0,1fr)_180px_44px]"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase lg:hidden">Temsilci</span>
                  <div className="flex h-10 items-center rounded-xl border border-border/65 bg-background/55 px-3 text-sm font-medium text-foreground">
                    {item.name || `Temsilci ${index + 1}`}
                  </div>
                </div>
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase lg:hidden">Süre (gün)</span>
                  <NumberInput
                    step="0.1"
                    min={0}
                    className={inputClassName}
                    value={item.avgGoLiveDurationDays}
                    onValueChange={(value) => {
                      const next = data.map((record, recordIndex) => (
                        recordIndex === index
                          ? { ...record, avgGoLiveDurationDays: Math.max(0, value) }
                          : record
                      ))
                      onDataChange(next)
                    }}
                  />
                </label>
                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-black/10 bg-white/80 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => {
                      if (!window.confirm(`${item.name || `Temsilci ${index + 1}`} kaydını silmek istiyor musun?`)) {
                        return
                      }
                      onDataChange(data.filter((_, recordIndex) => recordIndex !== index))
                    }}
                    aria-label={`${item.name || `Temsilci ${index + 1}`} kaydını sil`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
