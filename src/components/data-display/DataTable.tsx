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
  emptyMessage = 'Veri bulunamadi',
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
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white/70 shadow-[0_14px_34px_-30px_rgba(23,48,57,0.85)] backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-gradient-to-r from-white/90 to-white/45">
            {columns.map((col) => {
              const hasIkasHeader = /\bikas\b/i.test(col.header)
              return (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground',
                    hasIkasHeader ? 'normal-case' : 'uppercase',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
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
              className="border-b border-border/60 transition-colors hover:bg-white/55 last:border-0"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3.5',
                    col.align === 'right' && 'text-right',
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
  )
}
