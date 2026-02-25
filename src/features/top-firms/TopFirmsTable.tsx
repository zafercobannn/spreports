import { DataTable, type Column } from '@/components/data-display/DataTable'
import { TrendIndicator } from '@/components/data-display/TrendIndicator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'
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
    {
      key: 'shipmentSent',
      header: 'Gönderi',
      align: 'right',
      sortable: true,
      render: (row) => formatNumber(row.shipmentSent),
    },
    {
      key: 'ikasCargoValue',
      header: 'ikas Kargo',
      align: 'center',
      sortable: true,
      render: (row) => (
        row.ikasCargoValue > 0 ? (
          <Badge variant="success">Kullanıyor</Badge>
        ) : (
          <Badge variant="destructive">Kullanmıyor</Badge>
        )
      ),
    },
    {
      key: 'parsUsageRate',
      header: 'PARS',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={row.parsUsageRate >= 60 ? 'success' : row.parsUsageRate >= 45 ? 'warning' : 'destructive'}>
            Kullanan {formatPercent(row.parsUsageRate)}
          </Badge>
          <Badge variant="outline">
            Kullanmayan {formatPercent(100 - row.parsUsageRate)}
          </Badge>
        </div>
      ),
    },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DataTable data={data as any[]} columns={columns as any[]} />
}
