import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T, index: number) => ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = 'Veri bulunamadı',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        const aStr = String(aVal ?? '')
        const bStr = String(bVal ?? '')
        return sortDir === 'asc'
          ? aStr.localeCompare(bStr, 'tr')
          : bStr.localeCompare(aStr, 'tr')
      })
    : data

  if (data.length === 0) {
    return (
      <div className="lin-section flex items-center justify-center py-12 text-[12px] text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="lin-section overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((col) => {
                return (
                  <th
                    key={col.key}
                    className={cn(
                      'border-b border-border px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      col.sortable && 'cursor-pointer select-none hover:text-foreground',
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'justify-end w-full')}>
                      {col.header}
                      {col.sortable && (
                        sortKey === col.key ? (
                          sortDir === 'asc'
                            ? <ArrowUp className="h-3 w-3" />
                            : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                className="lin-row border-b border-border last:border-0"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3.5 py-2.5',
                      col.align === 'right' && 'text-right tabular font-mono',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
