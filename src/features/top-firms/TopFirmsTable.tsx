import { DataTable, type Column } from '@/components/data-display/DataTable'
import { TrendIndicator } from '@/components/data-display/TrendIndicator'
import { formatCurrency } from '@/utils/format'
import { getTrendDirection } from '@/utils/calculations'
import type { TopFirm } from '@/types/firms'

interface TopFirmsTableProps {
  data: TopFirm[]
}

export function TopFirmsTable({ data }: TopFirmsTableProps) {
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
          direction={getTrendDirection(row.gpvChange)}
          size="md"
        />
      ),
    },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DataTable data={data as any[]} columns={columns as any[]} />
}
