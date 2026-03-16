import { DataTable, type Column } from '@/components/data-display/DataTable'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import type { TargetBrand } from '@/types/targets'

interface TargetBrandsListProps {
  data: TargetBrand[]
  showStatus?: boolean
}

export function TargetBrandsList({ data, showStatus = true }: TargetBrandsListProps) {
  const columns: Column<TargetBrand>[] = [
    {
      key: 'name',
      header: 'Marka',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'sector',
      header: 'Sektör',
    },
    {
      key: 'estimatedRevenue',
      header: 'Tahmini Ciro',
      align: 'right',
      sortable: true,
      render: (row) => row.estimatedRevenue || '—',
    },
  ]

  if (showStatus) {
    columns.push({
      key: 'status',
      header: 'Durum',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DataTable data={data as any[]} columns={columns as any[]} />
}
