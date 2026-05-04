import { Trophy } from 'lucide-react'
import { formatCompactCurrency } from '@/utils/format'
import type { CohortRow } from '@/types/cohort'

interface CohortTopFirmsProps {
  rows: CohortRow[]
}

export function CohortTopFirms({ rows }: CohortTopFirmsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <div key={row.goLiveMonth} className="bento-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
              {row.goLiveMonth}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono tabular text-[11px] text-muted-foreground">
              <Trophy className="h-3 w-3 text-[var(--color-accent-text)]" />
              {row.firmCount} firma
            </span>
          </div>
          <ul className="space-y-2.5">
            {row.topFirms.slice(0, 3).map((firm, idx) => {
              const isFirst = idx === 0
              return (
                <li
                  key={firm.name}
                  className={
                    'flex items-center justify-between gap-3 rounded-xl px-3 py-2 ' +
                    (isFirst
                      ? 'bg-[var(--color-accent-soft)] text-foreground'
                      : 'bg-surface-muted/50 text-foreground')
                  }
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-semibold ' +
                        (isFirst
                          ? 'bg-foreground text-background'
                          : 'bg-surface text-foreground border border-border')
                      }
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate text-[13px] font-medium">{firm.name}</span>
                  </div>
                  <span className="shrink-0 font-mono tabular text-[12px] text-muted-foreground">
                    {formatCompactCurrency(firm.gpv)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
