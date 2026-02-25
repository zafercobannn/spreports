import { ChartContainer } from '@/components/charts/ChartContainer'
import { PieChart } from '@/components/charts/PieChart'
import type { TopFirm } from '@/types/firms'

interface ShippingUsageChartProps {
  data: TopFirm[]
}

export function ShippingUsageChart({ data }: ShippingUsageChartProps) {
  const usingCargo = data.filter((f) => f.ikasCargoValue > 0).length
  const notUsingCargo = data.length - usingCargo

  const chartData = [
    { id: 'ikas Kargo Kullanan', label: 'Kullanan', value: usingCargo },
    { id: 'Kullanmayan', label: 'Kullanmayan', value: notUsingCargo },
  ]

  return (
    <ChartContainer title="ikas Kargo Kullanım Oranı" subtitle="Top 15 içinde" height={250}>
      <PieChart
        data={chartData}
        colors={['#3d8d86', '#db6f6f']}
      />
    </ChartContainer>
  )
}
