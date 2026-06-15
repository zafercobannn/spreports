import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CohortMatrix } from '@/types/cohort'

interface CohortHeatmapEditorProps {
  data: CohortMatrix
  onChange: (next: CohortMatrix) => void
}

const SUFFIX_MULTIPLIERS: Record<string, number> = {
  m: 1_000_000,
  M: 1_000_000,
  k: 1_000,
  K: 1_000,
  b: 1_000_000_000,
  B: 1_000_000_000,
}

function parseSmartNumber(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return 0

  const match = trimmed.match(/^([0-9.,\s]+)\s*([a-zA-Z])?$/)
  if (!match) {
    const normalized = trimmed.replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const numPart = match[1].replace(/\s/g, '')
  const suffix = match[2] ?? ''

  const normalized = numPart.includes(',') && numPart.includes('.')
    ? numPart.replace(/\./g, '').replace(',', '.')
    : numPart.replace(',', '.')
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return 0

  const multiplier = SUFFIX_MULTIPLIERS[suffix] ?? 1
  return parsed * multiplier
}

// Yuvarlamadan, kısaltılmış biçimde 2 ondalık gösterir (örn. 20,17M).
function formatCompact(value: number): string {
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2).replace('.', ',')}K`
  return value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
}

function toNumber(value: string): number {
  return parseSmartNumber(value)
}

function SmartNumberCell({
  value,
  onCommit,
  className,
}: {
  value: number
  onCommit: (next: number) => void
  className?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const isFocused = draft !== null

  const handleBlur = () => {
    if (draft !== null) {
      const parsed = parseSmartNumber(draft)
      onCommit(Math.max(0, parsed))
    }
    setDraft(null)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={isFocused ? draft : formatCompact(value)}
      onFocus={() => setDraft(value === 0 ? '' : String(value))}
      onBlur={handleBlur}
      onChange={(e) => setDraft(e.target.value)}
      className={className}
    />
  )
}

export function CohortHeatmapEditor({ data, onChange }: CohortHeatmapEditorProps) {
  const maxValue = Math.max(
    1,
    ...data.rows.flatMap((row) => row.cells.map((cell) => cell.gpvValue)),
  )

  const updateRowLabel = (rowIdx: number, value: string) => {
    onChange({
      ...data,
      rows: data.rows.map((row, idx) => (
        idx === rowIdx
          ? {
              ...row,
              goLiveMonth: value,
              cells: row.cells.map((cell) => ({ ...cell, goLiveMonth: value })),
            }
          : row
      )),
    })
  }

  const updateFirmCount = (rowIdx: number, value: string) => {
    const firmCount = Math.max(0, Math.round(parseSmartNumber(value)))
    onChange({
      ...data,
      rows: data.rows.map((row, idx) => (
        idx === rowIdx ? { ...row, firmCount } : row
      )),
    })
  }

  const updateCellValue = (rowIdx: number, month: string, value: string) => {
    const gpvValue = Math.max(0, toNumber(value))
    onChange({
      ...data,
      rows: data.rows.map((row, idx) => {
        if (idx !== rowIdx) return row
        return {
          ...row,
          cells: row.cells.map((cell) => (
            cell.observedMonth === month ? { ...cell, gpvValue } : cell
          )),
        }
      }),
    })
  }

  const updateTopFirm = (
    rowIdx: number,
    topFirmIdx: number,
    field: 'name' | 'gpv',
    value: string,
  ) => {
    onChange({
      ...data,
      rows: data.rows.map((row, idx) => {
        if (idx !== rowIdx) return row
        const currentTopFirms = Array.from({ length: 3 }, (_, i) => row.topFirms[i] ?? { name: '', gpv: 0 })
        return {
          ...row,
          topFirms: currentTopFirms.map((firm, idxTop) => {
            if (idxTop !== topFirmIdx) return firm
            if (field === 'name') return { ...firm, name: value }
            return { ...firm, gpv: Math.max(0, toNumber(value)) }
          }),
        }
      }),
    })
  }

  const addRow = () => {
    const defaultMonth = data.months[data.rows.length % data.months.length] ?? `Cohort ${data.rows.length + 1}`
    onChange({
      ...data,
      rows: [
        ...data.rows,
        {
          goLiveMonth: defaultMonth,
          firmCount: 0,
          cells: data.months.map((month) => ({
            goLiveMonth: defaultMonth,
            observedMonth: month,
            gpvValue: 0,
          })),
          topFirms: [
            { name: '', gpv: 0 },
            { name: '', gpv: 0 },
            { name: '', gpv: 0 },
          ],
        },
      ],
    })
  }

  const removeRow = (rowIdx: number) => {
    onChange({
      ...data,
      rows: data.rows.filter((_, idx) => idx !== rowIdx),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Cohort Satırı Ekle
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-white/80 p-3">
        <table className="w-full min-w-[980px] border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="rounded-lg bg-muted/60 px-3 py-2 text-left text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Cohort Satırı
              </th>
              {data.months.map((month) => (
                <th
                  key={month}
                  className="rounded-lg bg-muted/60 px-2 py-2 text-center text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase"
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr key={`${row.goLiveMonth}-${rowIdx}`}>
                <td className="rounded-lg border border-border/70 bg-white/85 p-2 align-top">
                  <div className="space-y-2">
                    <input
                      value={row.goLiveMonth}
                      onChange={(e) => updateRowLabel(rowIdx, e.target.value)}
                      className="h-8 w-full rounded-md border border-border/80 bg-white px-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      placeholder="Cohort ayı"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Firma</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.firmCount}
                        onChange={(e) => updateFirmCount(rowIdx, e.target.value)}
                        className="h-7 w-20 rounded-md border border-border/80 bg-white px-2 text-xs text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeRow(rowIdx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </td>
                {data.months.map((month) => {
                  const cell = row.cells.find((item) => item.observedMonth === month)
                  const value = cell?.gpvValue ?? 0
                  const intensity = value <= 0 ? 0.08 : 0.12 + Math.min(0.56, (value / maxValue) * 0.56)

                  return (
                    <td key={`${row.goLiveMonth}-${month}`} className="p-0">
                      <div
                        className="rounded-lg border border-white/70 p-2 transition-colors"
                        style={{ backgroundColor: `rgba(88, 127, 146, ${intensity})` }}
                      >
                        <SmartNumberCell
                          value={value}
                          onCommit={(next) => updateCellValue(rowIdx, month, String(next))}
                          className="h-8 w-full rounded-md border border-white/80 bg-white/85 px-2 text-right text-xs font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Top 3 Firmalar (manuel)</h4>
        {data.rows.map((row, rowIdx) => (
          <div key={`top-${row.goLiveMonth}-${rowIdx}`} className="rounded-xl border border-border/70 bg-white/80 p-3">
            <p className="mb-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {row.goLiveMonth}
            </p>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, topIdx) => {
                const item = row.topFirms[topIdx] ?? { name: '', gpv: 0 }
                return (
                  <div key={topIdx} className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
                    <input
                      className="h-8 rounded-md border border-border/80 bg-white px-2 text-xs text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      value={item.name}
                      onChange={(e) => updateTopFirm(rowIdx, topIdx, 'name', e.target.value)}
                      placeholder={`Top ${topIdx + 1} marka`}
                    />
                    <SmartNumberCell
                      value={item.gpv}
                      onCommit={(next) => updateTopFirm(rowIdx, topIdx, 'gpv', String(next))}
                      className="h-8 rounded-md border border-border/80 bg-white px-2 text-xs text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
