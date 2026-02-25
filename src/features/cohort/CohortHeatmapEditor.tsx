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

  return (
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
            <tr key={row.goLiveMonth}>
              <td className="rounded-lg border border-border/70 bg-white/85 p-2 align-top">
                <p className="text-sm font-semibold text-foreground">{row.goLiveMonth}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Firma</span>
                  <input
                    type="number"
                    value={row.firmCount}
                    onChange={(e) => updateFirmCount(rowIdx, e.target.value)}
                    className="h-7 w-20 rounded-md border border-border/80 bg-white px-2 text-xs text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
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
  )
}
