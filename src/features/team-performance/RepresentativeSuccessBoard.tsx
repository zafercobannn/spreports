import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/utils/format'
import { average, sum } from '@/utils/calculations'
import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import { calculateRepresentativeMetrics } from './representative-success-utils'

interface RepresentativeSuccessBoardProps {
  data: RepresentativeSuccessRecord[]
  weights: RepresentativeSuccessWeights
  monthLabel: string
  year: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 80) return 'bg-amber-500'
  return 'bg-rose-500'
}

function getScoreLabel(score: number): { label: string; variant: 'success' | 'warning' | 'destructive' } {
  if (score >= 90) return { label: 'Mükemmel', variant: 'success' }
  if (score >= 80) return { label: 'İyi', variant: 'warning' }
  return { label: 'Geliştirilmeli', variant: 'destructive' }
}

export function RepresentativeSuccessBoard({
  data,
  weights,
  monthLabel,
  year,
}: RepresentativeSuccessBoardProps) {
  const rows = useMemo(() => {
    return data
      .map((record) => ({
        record,
        metrics: calculateRepresentativeMetrics(record, weights),
      }))
      .sort((a, b) => b.metrics.successIndex - a.metrics.successIndex)
  }, [data, weights])

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Bu dönem için temsilci başarı verisi bulunamadı.
        </CardContent>
      </Card>
    )
  }

  const top = rows[0]
  const avgLive = average(rows.map((row) => row.record.liveCount))
  const avgAudit = average(rows.map((row) => row.record.auditScore))
  const totalTarget = sum(rows.map((row) => row.record.liveTarget))
  const totalLive = sum(rows.map((row) => row.record.liveCount))
  const avgIndex = average(rows.map((row) => row.metrics.successIndex))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">
            {monthLabel} {year} Scale Plus Başarı Endeksi
          </CardTitle>
          <CardDescription>
            Temsilci bazlı performans, hedef ve kalite skorları
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border/70 bg-white/75 p-3">
            <p className="text-xs text-muted-foreground">Ortalama Canlıya Alınan</p>
            <p className="text-2xl font-semibold">{avgLive.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white/75 p-3">
            <p className="text-xs text-muted-foreground">Audit Ortalaması</p>
            <p className="text-2xl font-semibold">{avgAudit.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white/75 p-3">
            <p className="text-xs text-muted-foreground">Canlıya Alınan Hedef</p>
            <p className="text-2xl font-semibold">{formatNumber(totalTarget)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white/75 p-3">
            <p className="text-xs text-muted-foreground">Canlıya Alınan Toplam</p>
            <p className="text-2xl font-semibold">{formatNumber(totalLive)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white/75 p-3">
            <p className="text-xs text-muted-foreground">Başarı Endeksi Ort.</p>
            <p className="text-2xl font-semibold">{avgIndex.toFixed(1)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/30">
              {top.record.imageUrl ? (
                <img
                  src={top.record.imageUrl}
                  alt={top.record.name}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="flex h-52 items-center justify-center bg-gradient-to-b from-primary/10 to-primary/5 text-5xl font-semibold text-primary">
                  {getInitials(top.record.name)}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold">{top.record.name}</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-emerald-700">
                En yüksek performans <Star className="h-5 w-5" />
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-white/75 p-3 text-center">
              <p className="text-sm text-muted-foreground">Başarı Endeksi</p>
              <p className="text-3xl font-semibold">{top.metrics.successIndex.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Sıra</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Temsilci</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Başarı Endeksi</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Canlıya Alınan</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Hedef</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Audit</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">NPS</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">Toplantı</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const targetStatus = row.record.liveCount >= row.record.liveTarget ? 'Hedef Üstünde' : 'Hedef Altında'
                    const quality = getScoreLabel(row.metrics.successIndex)
                    const progress = row.record.liveTarget > 0
                      ? Math.min(120, (row.record.liveCount / row.record.liveTarget) * 100)
                      : 0

                    return (
                      <tr key={row.record.id} className="border-b border-border/50 last:border-0">
                        <td className="px-3 py-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/12 font-semibold text-primary">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {row.record.imageUrl ? (
                              <img
                                src={row.record.imageUrl}
                                alt={row.record.name}
                                className="h-8 w-8 rounded-md object-cover"
                              />
                            ) : (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                                {getInitials(row.record.name)}
                              </span>
                            )}
                            <span className="font-medium">{row.record.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{row.metrics.successIndex.toFixed(1)}</span>
                              <Badge variant={quality.variant}>{quality.label}</Badge>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${getScoreColor(row.metrics.successIndex)}`}
                                style={{ width: `${Math.min(100, row.metrics.successIndex)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-medium">{formatNumber(row.record.liveCount)}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatNumber(row.record.liveCount)}/{formatNumber(row.record.liveTarget)}
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-amber-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.08em]">{targetStatus}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-semibold">{row.record.auditScore.toFixed(1)}/100</td>
                        <td className="px-3 py-3 font-semibold">{row.record.npsScore.toFixed(2)}/5</td>
                        <td className="px-3 py-3 font-semibold">{row.record.meetingScore.toFixed(2)}/5</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
