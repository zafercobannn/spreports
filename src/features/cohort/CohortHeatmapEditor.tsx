import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CohortMatrix } from '@/types/cohort'

interface CohortHeatmapEditorProps {
  data: CohortMatrix
  onChange: (next: CohortMatrix) => void
}

function toNumber(value: string): number {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
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
    const firmCount = Math.max(0, Math.round(toNumber(value)))
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
                        type="number"
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
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => updateCellValue(rowIdx, month, e.target.value)}
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
                    <input
                      type="number"
                      className="h-8 rounded-md border border-border/80 bg-white px-2 text-xs text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      value={item.gpv}
                      onChange={(e) => updateTopFirm(rowIdx, topIdx, 'gpv', e.target.value)}
                      placeholder="GPV"
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
