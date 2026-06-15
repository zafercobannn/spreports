import { useEffect, useMemo, useState } from 'react'
import { Award, Calendar } from 'lucide-react'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'
import { getRepresentativePhoto } from '@/constants/representative-photos'
import { cn } from '@/lib/utils'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  aggregateRep,
  buildMetricRows,
  describeSelection,
  getPeriodKeysForSelection,
  listRepresentativesAcrossPeriods,
  type AggregatedRep,
  type PeriodSelection,
  type Scope,
} from './comparison-utils'

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const SCOPE_OPTIONS: { id: Scope; label: string }[] = [
  { id: 'monthly', label: 'Aylık' },
  { id: 'quarterly', label: 'Çeyreklik' },
  { id: 'yearly', label: 'Yıllık' },
]

const TODAY = new Date()
const DEFAULT_YEAR = TODAY.getFullYear()
const DEFAULT_MONTH = TODAY.getMonth() + 1

const initialLeft: PeriodSelection = { scope: 'monthly', year: DEFAULT_YEAR, value: DEFAULT_MONTH }
const initialRight: PeriodSelection = {
  scope: 'monthly',
  year: DEFAULT_MONTH === 1 ? DEFAULT_YEAR - 1 : DEFAULT_YEAR,
  value: DEFAULT_MONTH === 1 ? 12 : DEFAULT_MONTH - 1,
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

export function RepCompareTab() {
  const periods = useDashboardDataStore((s) => s.periods)
  const ensurePeriod = useDashboardDataStore((s) => s.ensurePeriod)

  const [leftSelection, setLeftSelection] = useState<PeriodSelection>(initialLeft)
  const [rightSelection, setRightSelection] = useState<PeriodSelection>(initialRight)

  const allKeys = useMemo(
    () => [
      ...new Set([
        ...getPeriodKeysForSelection(leftSelection),
        ...getPeriodKeysForSelection(rightSelection),
      ]),
    ],
    [leftSelection, rightSelection],
  )

  useEffect(() => {
    for (const key of allKeys) {
      const [yStr, mStr] = key.split('-')
      const y = Number(yStr)
      const m = Number(mStr)
      if (Number.isFinite(y) && Number.isFinite(m)) void ensurePeriod(y, m)
    }
  }, [allKeys, ensurePeriod])

  const leftReps = useMemo(() => listRepresentativesAcrossPeriods(leftSelection, periods), [leftSelection, periods])
  const rightReps = useMemo(() => listRepresentativesAcrossPeriods(rightSelection, periods), [rightSelection, periods])

  const allRepNames = useMemo(() => {
    const set = new Set<string>([...leftReps, ...rightReps])
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [leftReps, rightReps])

  const [leftName, setLeftName] = useState<string>('')
  const [rightName, setRightName] = useState<string>('')

  useEffect(() => {
    if (!leftName && allRepNames.length > 0) setLeftName(allRepNames[0])
  }, [allRepNames, leftName])
  useEffect(() => {
    if (!rightName && allRepNames.length > 1) setRightName(allRepNames[1])
    else if (!rightName && allRepNames.length === 1) setRightName(allRepNames[0])
  }, [allRepNames, rightName])

  const leftRep = useMemo<AggregatedRep | null>(
    () => (leftName ? aggregateRep(leftName, leftSelection, periods) : null),
    [leftName, leftSelection, periods],
  )
  const rightRep = useMemo<AggregatedRep | null>(
    () => (rightName ? aggregateRep(rightName, rightSelection, periods) : null),
    [rightName, rightSelection, periods],
  )

  const metricRows = useMemo(
    () => (leftRep && rightRep ? buildMetricRows(leftRep, rightRep) : []),
    [leftRep, rightRep],
  )

  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    for (const k of Object.keys(periods)) {
      const y = Number(k.split('-')[0])
      if (Number.isFinite(y)) years.add(y)
    }
    years.add(DEFAULT_YEAR)
    return Array.from(years).sort((a, b) => b - a)
  }, [periods])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PanelSelector
          side="SOL"
          accent="lime"
          repNames={allRepNames}
          repValue={leftName}
          onRepChange={setLeftName}
          selection={leftSelection}
          onSelectionChange={setLeftSelection}
          yearOptions={yearOptions}
        />
        <PanelSelector
          side="SAĞ"
          accent="ink"
          repNames={allRepNames}
          repValue={rightName}
          onRepChange={setRightName}
          selection={rightSelection}
          onSelectionChange={setRightSelection}
          yearOptions={yearOptions}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ProfileCard rep={leftRep} fallbackName={leftName} accent="lime" selection={leftSelection} />
        <ProfileCard rep={rightRep} fallbackName={rightName} accent="ink" selection={rightSelection} />
      </div>

      <div className="bento-card overflow-hidden">
        <div className="flex items-end justify-between gap-3 px-6 pt-5 pb-4">
          <div className="space-y-1">
            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
              Performans Karşılaştırması
            </span>
            <p className="text-[12px] text-muted-foreground">
              Sol vs sağ — yeşil daha iyi, kırmızı daha düşük
            </p>
          </div>
        </div>
        {leftRep && rightRep ? (
          <ul className="divide-y divide-border">
            {metricRows.map((row) => {
              const diff = row.rightValue - row.leftValue
              const baseline = Math.max(Math.abs(row.leftValue), Math.abs(row.rightValue), 1)
              const deltaPct = (diff / baseline) * 100
              const leftBetter = row.higherIsBetter ? row.leftValue >= row.rightValue : row.leftValue <= row.rightValue
              const rightBetter = row.higherIsBetter ? row.rightValue >= row.leftValue : row.rightValue <= row.leftValue
              const equal = row.leftValue === row.rightValue
              const sign = diff >= 0 ? '+' : ''

              return (
                <li
                  key={row.label}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 sm:gap-8"
                >
                  <span
                    className={cn(
                      'text-right font-mono tabular text-[18px] font-semibold tracking-tight',
                      equal ? 'text-foreground' : leftBetter ? 'text-[#0a7a4d]' : 'text-[#c92240]',
                    )}
                  >
                    {row.format(row.leftValue)}
                  </span>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {row.label}
                    </span>
                    {!equal && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tabular',
                          rightBetter
                            ? 'bg-[#dff7ec] text-[#0a7a4d]'
                            : 'bg-[#ffe5ea] text-[#c92240]',
                        )}
                      >
                        {sign}{deltaPct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-left font-mono tabular text-[18px] font-semibold tracking-tight',
                      equal ? 'text-foreground' : rightBetter ? 'text-[#0a7a4d]' : 'text-[#c92240]',
                    )}
                  >
                    {row.format(row.rightValue)}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-[13px] text-muted-foreground">Veri yok</div>
        )}
      </div>
    </div>
  )
}

function PanelSelector({
  side,
  accent,
  repNames,
  repValue,
  onRepChange,
  selection,
  onSelectionChange,
  yearOptions,
}: {
  side: string
  accent: 'lime' | 'ink'
  repNames: string[]
  repValue: string
  onRepChange: (v: string) => void
  selection: PeriodSelection
  onSelectionChange: (s: PeriodSelection) => void
  yearOptions: number[]
}) {
  const accentDot = accent === 'lime' ? 'bg-[#a8c428]' : 'bg-[#1a1a1d]'

  return (
    // overflow-visible needed so SearchableSelect popover can spill outside the bento-card
    <div className="bento-card p-5" style={{ overflow: 'visible' }}>
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('inline-block h-2 w-2 rounded-full', accentDot)} />
        <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
          {side}
        </span>
      </div>

      <SearchableSelect
        value={repValue}
        onChange={(v) => onRepChange(String(v))}
        options={
          repNames.length === 0
            ? [{ value: '', label: 'Temsilci verisi yok' }]
            : repNames.map((n) => ({ value: n, label: n }))
        }
        searchable
        placeholder="Temsilci seç"
        triggerClassName="h-11 w-full justify-between rounded-2xl px-4 text-[14px]"
        popoverClassName="w-full"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchableSelect
          value={selection.year}
          onChange={(v) => onSelectionChange({ ...selection, year: Number(v) })}
          options={yearOptions.map((y) => ({ value: y, label: String(y) }))}
          renderTrigger={(opt) => (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono">{opt?.label}</span>
            </span>
          )}
          triggerClassName="font-mono text-[12px]"
        />

        <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-1">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cn(
                'rounded-full px-3 py-1 text-[12px] font-medium transition-colors',
                selection.scope === opt.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() =>
                onSelectionChange({
                  scope: opt.id,
                  year: selection.year,
                  value: opt.id === 'monthly' ? DEFAULT_MONTH : 1,
                })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selection.scope === 'monthly' && (
          <SearchableSelect
            value={selection.value}
            onChange={(v) => onSelectionChange({ ...selection, value: Number(v) })}
            options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
            popoverClassName="min-w-[160px]"
            renderTrigger={(opt) => (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {opt?.label}
              </span>
            )}
          />
        )}
        {selection.scope === 'quarterly' && (
          <SearchableSelect
            value={selection.value}
            onChange={(v) => onSelectionChange({ ...selection, value: Number(v) })}
            options={QUARTERS.map((q, i) => ({ value: i + 1, label: q }))}
            popoverClassName="min-w-[120px]"
          />
        )}
      </div>
    </div>
  )
}

function ProfileCard({
  rep,
  fallbackName,
  accent,
  selection,
}: {
  rep: AggregatedRep | null
  fallbackName: string
  accent: 'lime' | 'ink'
  selection: PeriodSelection
}) {
  const isInk = accent === 'ink'
  const score = rep?.successIndex ?? 0
  const status =
    score >= 80 ? { label: 'İyi', cls: 'bg-[#dff7ec] text-[#0a7a4d]' } :
    score >= 60 ? { label: 'Orta', cls: 'bg-[#fff0d6] text-[#a36400]' } :
    { label: 'Geliştirilmeli', cls: 'bg-[#ffe5ea] text-[#c92240]' }

  if (!rep) {
    return (
      <div className="bento-card flex items-center justify-center gap-3 p-5 text-muted-foreground">
        <Award className="h-4 w-4" />
        <span className="text-[13px]">
          {fallbackName ? `${fallbackName} · ${describeSelection(selection)} dönemi için veri yok` : 'Temsilci seçilmedi'}
        </span>
      </div>
    )
  }

  const initials = getInitials(rep.name)
  const photo = rep.imageUrl || getRepresentativePhoto(rep.name)

  return (
    <div className="bento-card relative overflow-hidden p-5">
      {!isInk && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(150deg, var(--color-accent) 0%, var(--color-accent-soft) 55%, var(--color-surface-warm) 100%)',
          }}
        />
      )}
      {isInk && <div className="absolute inset-0 bg-foreground" />}

      <div className={cn('relative flex items-center justify-between gap-4', isInk && 'text-background')}>
        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt={rep.name}
              className="h-16 w-16 rounded-2xl border-2 border-white/80 object-cover shadow-sm"
            />
          ) : (
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/80 text-[18px] font-semibold',
                isInk ? 'bg-white/15 text-background' : 'bg-foreground text-background',
              )}
            >
              {initials}
            </div>
          )}
          <div>
            <p className={cn('text-[20px] font-semibold tracking-tight', isInk ? 'text-background' : 'text-foreground')}>
              {rep.name}
            </p>
            <p className={cn('text-[12px]', isInk ? 'text-background/65' : 'text-foreground/60')}>
              {describeSelection(selection)} · {rep.coveredMonths} ay verisi
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.16em]', isInk ? 'text-background/55' : 'text-foreground/55')}>
            Başarı
          </p>
          <p className={cn('font-mono tabular text-[36px] font-semibold leading-none tracking-[-0.025em]', isInk ? 'text-background' : 'text-foreground')}>
            {score.toFixed(1)}
          </p>
          <span className={cn('mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold', status.cls)}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  )
}
