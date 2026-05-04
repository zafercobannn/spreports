import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getRepresentativePhoto } from '@/constants/representative-photos'
import { formatNumber } from '@/utils/format'
import { average } from '@/utils/calculations'
import type { RepresentativeSuccessRecord, RepresentativeSuccessWeights } from '@/types/team'
import { calculateRepresentativeMetrics, isRepresentativeCsatPeriod } from './representative-success-utils'

interface RepresentativeSuccessBoardProps {
  data: RepresentativeSuccessRecord[]
  weights: RepresentativeSuccessWeights
  month: number
  monthLabel: string
  trackedRealizedCount: number
  trackedTargetCount: number
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
  if (score >= 80) return 'bg-[var(--color-accent)]'
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
  month,
  monthLabel,
  trackedRealizedCount,
  trackedTargetCount,
  year,
}: RepresentativeSuccessBoardProps) {
  const usesCsatModel = isRepresentativeCsatPeriod(year, month)

  const rows = useMemo(() => {
    return data
      .map((record) => ({
        record,
        metrics: calculateRepresentativeMetrics(record, weights, year, month),
      }))
      .sort((a, b) => b.metrics.successIndex - a.metrics.successIndex)
  }, [data, month, weights, year])

  if (rows.length === 0) {
    return (
      <div className="bento-card py-12 text-center text-[12px] text-muted-foreground">
        Bu dönem için temsilci başarı verisi bulunamadı.
      </div>
    )
  }

  const top = rows[0]
  const avgLive = average(rows.map((row) => row.record.liveCount))
  const avgAudit = average(rows.map((row) => row.record.auditScore))
  const avgIndex = average(rows.map((row) => row.metrics.successIndex))

  const stats = [
    { label: 'Ort. Canlıya Alınan', value: avgLive.toFixed(1) },
    { label: 'Audit Ortalaması', value: avgAudit.toFixed(1) },
    { label: 'Canlıya Alınan Hedef', value: formatNumber(trackedTargetCount) },
    { label: 'Canlıya Alınan Toplam', value: formatNumber(trackedRealizedCount) },
    { label: 'Başarı Endeksi Ort.', value: avgIndex.toFixed(1) },
  ]

  return (
    <div className="space-y-4">
      {/* Header card with stat strip */}
      <div className="bento-card overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-5 pb-4">
          <div className="space-y-1.5">
            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
              {monthLabel} {year} · Scale Plus
            </span>
            <h3 className="text-[20px] font-semibold tracking-tight text-foreground">
              Başarı Endeksi
            </h3>
            <p className="text-[12.5px] text-muted-foreground">
              Temsilci bazlı performans, hedef ve kalite skorları
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="px-2.5 py-1">
              {rows.length} temsilci
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border bg-surface-muted/40 px-6 py-4 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
                {s.label}
              </p>
              <p className="font-mono tabular text-[22px] font-semibold leading-none tracking-[-0.02em] text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Spotlight + Leaderboard */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Spotlight */}
        <div className="bento-card relative overflow-hidden p-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(165deg, var(--color-accent) 0%, var(--color-accent-soft) 50%, var(--color-surface-warm) 100%)',
            }}
          />
          <div className="relative flex h-full flex-col gap-4 p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                Spotlight
              </span>
              <Star className="h-3.5 w-3.5 text-foreground/70" />
            </div>

            <div className="overflow-hidden rounded-2xl border-4 border-white/70 shadow-md">
              {(top.record.imageUrl || getRepresentativePhoto(top.record.name)) ? (
                <img
                  src={top.record.imageUrl || getRepresentativePhoto(top.record.name)}
                  alt={top.record.name}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-foreground text-[56px] font-semibold text-background">
                  {getInitials(top.record.name)}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[20px] font-semibold tracking-tight text-foreground">{top.record.name}</h3>
              <p className="mt-0.5 text-[12px] text-foreground/60">En yüksek başarı endeksi</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-foreground/8 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-foreground/60">
                  Endeks
                </p>
                <p className="mt-0.5 font-mono tabular text-[22px] font-semibold tracking-[-0.02em] text-foreground">
                  {top.metrics.successIndex.toFixed(1)}
                </p>
              </div>
              <div className="rounded-xl bg-foreground/8 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-foreground/60">
                  Canlı
                </p>
                <p className="mt-0.5 font-mono tabular text-[22px] font-semibold tracking-[-0.02em] text-foreground">
                  {formatNumber(top.record.liveCount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bento-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
              Leaderboard
            </span>
            <span className="font-mono tabular text-[11px] text-muted-foreground">
              {monthLabel} {year}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-[12.5px] ${usesCsatModel ? 'min-w-[820px]' : 'min-w-[900px]'}`}>
              <thead>
                <tr className="border-b border-border bg-surface-muted/50">
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Sıra</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Temsilci</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Başarı Endeksi</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Canlıya Alınan</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Hedef</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Audit</th>
                  {usesCsatModel ? (
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">CSAT</th>
                  ) : (
                    <>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">NPS</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Toplantı</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const targetStatus = row.record.liveCount >= row.record.liveTarget ? 'Hedef Üstünde' : 'Hedef Altında'
                  const quality = getScoreLabel(row.metrics.successIndex)
                  const progress = row.record.liveTarget > 0
                    ? Math.min(120, (row.record.liveCount / row.record.liveTarget) * 100)
                    : 0
                  const isFirst = idx === 0

                  return (
                    <tr key={row.record.id} className="border-b border-border last:border-0 transition-colors hover:bg-hover">
                      <td className="px-3 py-3">
                        <span
                          className={
                            'inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] font-semibold ' +
                            (isFirst
                              ? 'bg-[var(--color-accent)] text-foreground'
                              : 'bg-surface-muted text-muted-foreground border border-border')
                          }
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          {(row.record.imageUrl || getRepresentativePhoto(row.record.name)) ? (
                            <img
                              src={row.record.imageUrl || getRepresentativePhoto(row.record.name)}
                              alt={row.record.name}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                          ) : (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-surface-muted text-[10px] font-semibold text-foreground border border-border">
                              {getInitials(row.record.name)}
                            </span>
                          )}
                          <span className="font-medium text-foreground">{row.record.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono tabular font-semibold text-foreground">{row.metrics.successIndex.toFixed(1)}</span>
                            <Badge variant={quality.variant}>{quality.label}</Badge>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-track">
                            <div
                              className={`bar-grow h-full ${getScoreColor(row.metrics.successIndex)}`}
                              style={{ width: `${Math.min(100, row.metrics.successIndex)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono tabular text-foreground">{formatNumber(row.record.liveCount)}</td>
                      <td className="px-3 py-3">
                        <div className="space-y-1.5">
                          <div className="font-mono tabular text-foreground">
                            {formatNumber(row.record.liveCount)}/{formatNumber(row.record.liveTarget)}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-track">
                            <div
                              className="bar-grow h-full bg-[var(--color-accent)]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{targetStatus}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono tabular font-semibold text-foreground">{row.record.auditScore.toFixed(1)}/100</td>
                      {usesCsatModel ? (
                        <td className="px-3 py-3 font-mono tabular font-semibold text-foreground">{row.record.csatScore.toFixed(2)}/5</td>
                      ) : (
                        <>
                          <td className="px-3 py-3 font-mono tabular font-semibold text-foreground">{row.record.npsScore.toFixed(2)}/5</td>
                          <td className="px-3 py-3 font-mono tabular font-semibold text-foreground">{row.record.meetingScore.toFixed(2)}/5</td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
