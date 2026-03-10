import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NumberInput } from '@/components/ui/number-input'
import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import { isCloudPersistenceEnabled } from '@/services/firebase/dashboard-period-service'
import { parseRepresentativeCsv } from './representative-success-utils'

interface RepresentativeSuccessAdminProps {
  data: RepresentativeSuccessRecord[]
  weights: RepresentativeSuccessWeights
  monthLabel: string
  year: number
  onDataChange: (next: RepresentativeSuccessRecord[]) => void
  onWeightsChange: (next: RepresentativeSuccessWeights) => void
}

const inputClassName =
  'h-9 w-full min-w-0 rounded-lg border border-border/80 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

export function RepresentativeSuccessAdmin({
  data,
  weights,
  monthLabel,
  year,
  onDataChange,
  onWeightsChange,
}: RepresentativeSuccessAdminProps) {
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvInfo, setCsvInfo] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const totalWeight = weights.liveCount + weights.auditScore + weights.npsScore + weights.meetingScore

  const handleCsvChange = async (file: File | null) => {
    if (!file) return
    setFileName(file.name)
    setCsvError(null)
    setCsvInfo(null)

    try {
      const text = await file.text()
      const parsed = parseRepresentativeCsv(text)
      onDataChange(parsed)
      setCsvInfo(`${parsed.length} temsilci verisi yüklendi. (Önceki kayıt: ${data.length})`)
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : 'CSV okunamadı.')
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>CSV Dosyası Yükle</CardTitle>
          <CardDescription>
            {monthLabel} {year} dönemi için temsilci başarı CSV dosyası yükle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              void handleCsvChange(e.target.files?.[0] ?? null)
            }}
          />

          <div className="rounded-xl border border-dashed border-border/80 bg-white/70 p-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Dosya adı: <span className="font-medium text-foreground">{fileName || 'Seçilmedi'}</span>
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Bulut kayıt durumu: {isCloudPersistenceEnabled() ? 'Aktif (Firebase remote-first)' : 'Pasif (local fallback)'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                CSV Seç
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = ''
                  setFileName('')
                  setCsvError(null)
                  setCsvInfo(null)
                }}
              >
                Temizle
              </Button>
            </div>
          </div>

          {csvError && <p className="text-sm font-medium text-destructive">{csvError}</p>}
          {csvInfo && <p className="text-sm font-medium text-emerald-700">{csvInfo}</p>}

          <div className="rounded-xl border border-border/70 bg-white/65 p-3">
            <p className="mb-2 text-sm font-semibold text-foreground">CSV başlıkları</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">Temsilci / MT Adı</Badge>
              <Badge variant="outline">Canlıya Alınan Hesap Sayısı</Badge>
              <Badge variant="outline">Canlıya Alınan Hesap Sayısı Hedefi</Badge>
              <Badge variant="outline">Canlıya Alınan Firma Adedi</Badge>
              <Badge variant="outline">Audit Puanı</Badge>
              <Badge variant="outline">NPS Anket Skoru / Onboarding Anket Skoru</Badge>
              <Badge variant="outline">Ortalama Canlıya Alma Süresi (gün) - opsiyonel</Badge>
              <Badge variant="outline">Toplantı Değerlendirmesi</Badge>
              <Badge variant="outline">Görsel URL (opsiyonel)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ortalama Canlıya Alma Süresi (Gün)</CardTitle>
          <CardDescription>
            Temsilci bazlı manuel süre değerlerini düzenle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Önce CSV ile temsilci yükleyip ardından süre girişi yapabilirsin.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="hidden grid-cols-[minmax(0,1fr)_180px] gap-2 px-1 md:grid">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Temsilci</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Süre (gün)</span>
              </div>
              {data.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
                  <div className="flex h-9 items-center rounded-lg border border-border/80 bg-muted/20 px-3 text-sm font-medium text-foreground">
                    {item.name || `Temsilci ${index + 1}`}
                  </div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI Ağırlık Ayarları</CardTitle>
          <CardDescription>Başarı endeksi hesaplamasında kullanılan ağırlıkları düzenle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-white/70 p-3">
            <p className="mb-2 text-sm text-muted-foreground">Toplam Ağırlık</p>
            <p className={`text-2xl font-semibold ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
              %{totalWeight}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              <span className="text-xs text-muted-foreground">NPS</span>
              <NumberInput
                className={inputClassName}
                value={weights.npsScore}
                onValueChange={(value) => onWeightsChange({ ...weights, npsScore: Math.max(0, value) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Toplantı</span>
              <NumberInput
                className={inputClassName}
                value={weights.meetingScore}
                onValueChange={(value) => onWeightsChange({ ...weights, meetingScore: Math.max(0, value) })}
              />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
