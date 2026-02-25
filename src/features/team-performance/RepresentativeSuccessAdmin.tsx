import { useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import {
  isCloudPersistenceEnabled,
  uploadRepresentativeImageToCloud,
} from '@/services/firebase/dashboard-period-service'
import { parseRepresentativeCsv } from './representative-success-utils'

interface RepresentativeSuccessAdminProps {
  data: RepresentativeSuccessRecord[]
  weights: RepresentativeSuccessWeights
  monthLabel: string
  month: number
  year: number
  onDataChange: (next: RepresentativeSuccessRecord[]) => void
  onWeightsChange: (next: RepresentativeSuccessWeights) => void
}

const inputClassName =
  'h-9 w-full min-w-0 rounded-lg border border-border/80 bg-white/90 px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20'

function toNumber(value: string): number {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

export function RepresentativeSuccessAdmin({
  data,
  weights,
  monthLabel,
  month,
  year,
  onDataChange,
  onWeightsChange,
}: RepresentativeSuccessAdminProps) {
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvInfo, setCsvInfo] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [uploadingRecordId, setUploadingRecordId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const totalWeight = weights.liveCount + weights.auditScore + weights.npsScore + weights.meetingScore

  const updateRecord = (id: string, updater: (record: RepresentativeSuccessRecord) => RepresentativeSuccessRecord) => {
    onDataChange(
      data.map((record) => (record.id === id ? updater(record) : record)),
    )
  }

  const handleCsvChange = async (file: File | null) => {
    if (!file) return
    setFileName(file.name)
    setCsvError(null)
    setCsvInfo(null)

    try {
      const text = await file.text()
      const parsed = parseRepresentativeCsv(text)
      onDataChange(parsed)
      setCsvInfo(`${parsed.length} temsilci verisi yüklendi.`)
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : 'CSV okunamadı.')
    }
  }

  const loadImageAsDataUrl = (id: string, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      updateRecord(id, (record) => ({ ...record, imageUrl: result }))
      setCsvInfo('Görsel tarayıcı belleğine kaydedildi.')
    }
    reader.readAsDataURL(file)
  }

  const handleImageFile = async (id: string, file: File | null) => {
    if (!file) return
    setCsvError(null)
    setCsvInfo(null)

    if (isCloudPersistenceEnabled()) {
      try {
        setUploadingRecordId(id)
        const imageUrl = await uploadRepresentativeImageToCloud(year, month, id, file)
        updateRecord(id, (record) => ({ ...record, imageUrl }))
        setCsvInfo('Görsel buluta yüklendi ve kalıcı olarak kaydedildi.')
        return
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Görsel buluta yüklenemedi.'
        setCsvError(`${message} Görsel geçici olarak local kaydedildi.`)
      } finally {
        setUploadingRecordId((current) => (current === id ? null : current))
      }
    }

    loadImageAsDataUrl(id, file)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>CSV Dosyası Yükle</CardTitle>
          <CardDescription>
            {monthLabel} {year} dönemi için temsilci başarı CSV dosyası yükle. Görseller buluta kaydedilir.
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
              Bulut kayıt durumu: {isCloudPersistenceEnabled() ? 'Aktif (Firebase)' : 'Pasif (local fallback)'}
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
              <Badge variant="outline">Toplantı Değerlendirmesi</Badge>
              <Badge variant="outline">Görsel URL (opsiyonel)</Badge>
            </div>
          </div>
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
              <input
                type="number"
                className={inputClassName}
                value={weights.liveCount}
                onChange={(e) => onWeightsChange({ ...weights, liveCount: Math.max(0, toNumber(e.target.value)) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Audit</span>
              <input
                type="number"
                className={inputClassName}
                value={weights.auditScore}
                onChange={(e) => onWeightsChange({ ...weights, auditScore: Math.max(0, toNumber(e.target.value)) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">NPS</span>
              <input
                type="number"
                className={inputClassName}
                value={weights.npsScore}
                onChange={(e) => onWeightsChange({ ...weights, npsScore: Math.max(0, toNumber(e.target.value)) })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Toplantı</span>
              <input
                type="number"
                className={inputClassName}
                value={weights.meetingScore}
                onChange={(e) => onWeightsChange({ ...weights, meetingScore: Math.max(0, toNumber(e.target.value)) })}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Temsilci Başarı Verileri</CardTitle>
          <CardDescription>Gerektiğinde manuel düzenleme yapabilirsin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,1fr)_90px_40px] xl:gap-2 xl:px-1">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Temsilci</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Canlı</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Hedef</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Audit</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">NPS</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Toplantı</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Görsel URL</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Görsel</span>
            <span />
          </div>

          {data.map((record) => (
            <div
              key={record.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,0.55fr)_minmax(0,1fr)_90px_40px]"
            >
              <input
                className={inputClassName}
                value={record.name}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, name: e.target.value }))}
                placeholder="Temsilci adı"
              />
              <input
                type="number"
                className={inputClassName}
                value={record.liveCount}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, liveCount: Math.max(0, toNumber(e.target.value)) }))}
              />
              <input
                type="number"
                className={inputClassName}
                value={record.liveTarget}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, liveTarget: Math.max(0, toNumber(e.target.value)) }))}
              />
              <input
                type="number"
                className={inputClassName}
                value={record.auditScore}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, auditScore: Math.max(0, Math.min(100, toNumber(e.target.value))) }))}
              />
              <input
                type="number"
                step="0.01"
                className={inputClassName}
                value={record.npsScore}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, npsScore: Math.max(0, Math.min(5, toNumber(e.target.value))) }))}
              />
              <input
                type="number"
                step="0.01"
                className={inputClassName}
                value={record.meetingScore}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, meetingScore: Math.max(0, Math.min(5, toNumber(e.target.value))) }))}
              />
              <input
                className={inputClassName}
                value={record.imageUrl ?? ''}
                onChange={(e) => updateRecord(record.id, (current) => ({ ...current, imageUrl: e.target.value }))}
                placeholder="https://... veya local path"
              />
              <label
                className={`inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border/80 bg-white/90 px-2 text-xs text-foreground transition ${
                  uploadingRecordId === record.id ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-white'
                }`}
              >
                <ImagePlus className="h-4 w-4" />
                {uploadingRecordId === record.id ? 'Yükleniyor' : 'Dosya'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingRecordId === record.id}
                  onChange={(e) => {
                    void handleImageFile(record.id, e.target.files?.[0] ?? null)
                  }}
                />
              </label>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onDataChange(data.filter((item) => item.id !== record.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onDataChange([
                ...data,
                {
                  id: `rep-${Date.now()}`,
                  name: '',
                  liveCount: 0,
                  liveTarget: 0,
                  auditScore: 0,
                  npsScore: 0,
                  meetingScore: 0,
                  imageUrl: '',
                },
              ])
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Temsilci Ekle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
