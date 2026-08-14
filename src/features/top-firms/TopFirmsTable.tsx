import { useEffect, useMemo, useState } from 'react'
import { StickyNote } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-display/DataTable'
import { TrendIndicator } from '@/components/data-display/TrendIndicator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import { getTrendDirection } from '@/utils/calculations'
import { calculateGpvChangePercent } from '@/utils/top-firm-metrics'
import { useAdminAuth } from '@/features/auth/AdminAuthProvider'
import { useFirmNotesStore } from '@/stores/firm-notes-store'
import { usePresentationStore } from '@/stores/presentation-store'
import { FirmNotesDrawer } from './FirmNotesDrawer'
import type { TopFirm } from '@/types/firms'

interface TopFirmsTableProps {
  data: TopFirm[]
}

export function TopFirmsTable({ data }: TopFirmsTableProps) {
  const { isAdmin } = useAdminAuth()
  const [openFirm, setOpenFirm] = useState<string | null>(null)
  const loadAllNotes = useFirmNotesStore((s) => s.loadAll)

  useEffect(() => {
    void loadAllNotes()
  }, [loadAllNotes])

  const renderUsageBadge = (isUsing: boolean) => (
    <Badge variant={isUsing ? 'success' : 'destructive'}>
      {isUsing ? 'Kullanıyor' : 'Kullanmıyor'}
    </Badge>
  )

  const rows = useMemo(
    () => data.map((row) => ({
      ...row,
      gpvChange: calculateGpvChangePercent(row.gpv, row.previousMonthGPV),
    })),
    [data],
  )

  const columns: Column<TopFirm>[] = [
    {
      key: 'rank',
      header: '#',
      width: '50px',
      render: (row) => (
        <span className="font-bold text-muted-foreground">{row.rank}</span>
      ),
    },
    {
      key: 'name',
      header: 'Mağaza',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'sector',
      header: 'Sektör',
      sortable: true,
      render: (row) => (
        row.sector
          ? <Badge variant="outline">{row.sector}</Badge>
          : <span className="text-subtle">—</span>
      ),
    },
    {
      key: 'gpv',
      header: 'GPV',
      align: 'right',
      sortable: true,
      render: (row) => formatCurrency(row.gpv),
    },
    {
      key: 'previousMonthGPV',
      header: 'Önceki Ay GPV',
      align: 'right',
      render: (row) => (
        <span className="text-muted-foreground">
          {row.previousMonthGPV > 0 ? formatCurrency(row.previousMonthGPV) : '-'}
        </span>
      ),
    },
    {
      key: 'gpvChange',
      header: 'Değişim',
      align: 'right',
      sortable: true,
      render: (row) => (
        <TrendIndicator
          value={row.gpvChange}
          direction={getTrendDirection(row.gpvChange, 0)}
          alwaysShowValue
          size="md"
        />
      ),
    },
    {
      key: 'usesPars',
      header: 'Pars',
      align: 'center',
      render: (row) => renderUsageBadge(row.usesPars),
    },
    {
      key: 'usesPwi',
      header: 'PWI',
      align: 'center',
      render: (row) => renderUsageBadge(row.usesPwi),
    },
    {
      key: 'firmNotes',
      header: 'Not',
      align: 'right',
      width: '90px',
      render: (row) => (
        <div className="flex justify-end">
          <FirmNoteTriggerButton
            firmName={row.name}
            canEdit={isAdmin}
            onClick={() => setOpenFirm(row.name)}
          />
        </div>
      ),
    },
  ]

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DataTable data={rows as any[]} columns={columns as any[]} />
      <FirmNotesDrawer firmName={openFirm} onClose={() => setOpenFirm(null)} />
    </>
  )
}

function FirmNoteTriggerButton({
  firmName,
  canEdit,
  onClick,
}: {
  firmName: string
  canEdit: boolean
  onClick: () => void
}) {
  const count = useFirmNotesStore((s) => s.notesByFirm[firmName]?.length ?? 0)
  const isPresenting = usePresentationStore((s) => s.mode !== 'off')

  // In presentation mode: only render when there are actual notes — empty
  // affordances would clutter the slide.
  if (isPresenting && count === 0) return null
  // Outside presentation: show empty affordance only to authors.
  if (count === 0 && !canEdit) return null

  return (
    <button
      type="button"
      onClick={onClick}
      title={count > 0 ? `${count} not` : 'Detay'}
      className={
        'inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] font-semibold tracking-[0.04em] transition-colors ' +
        (count > 0
          ? 'border-transparent bg-[var(--color-accent)] text-foreground hover:bg-[var(--color-accent-soft)]'
          : 'border-border bg-surface-muted text-muted-foreground hover:border-foreground/20 hover:text-foreground')
      }
    >
      <StickyNote className="h-3 w-3" />
      {count > 0 ? <span className="font-mono tabular">{count}</span> : 'Detay'}
    </button>
  )
}
