import { DataTable, type Column } from '@/components/data-display/DataTable'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { formatCurrency } from '@/utils/format'
import type { TargetBrand } from '@/types/targets'

interface TargetBrandsListProps {
  data: TargetBrand[]
}

export function TargetBrandsList({ data }: TargetBrandsListProps) {
  const columns: Column<TargetBrand>[] = [
    {
      key: 'name',
      header: 'Marka',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'sector',
      header: 'Sektor',
    },
    {
      key: 'estimatedRevenue',
      header: 'Tahmini Ciro',
      align: 'right',
      sortable: true,
      render: (row) => formatCurrency(row.estimatedRevenue),
    },
    {
      key: 'status',
      header: 'Durum',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DataTable data={data as any[]} columns={columns as any[]} />
}
