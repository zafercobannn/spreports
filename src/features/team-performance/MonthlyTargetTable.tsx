import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatCurrency } from '@/utils/format'
import type { MonthlyTarget } from '@/types/team'

interface MonthlyTargetTableProps {
  data: MonthlyTarget[]
  monthLabel: string
}

export function MonthlyTargetTable({ data, monthLabel }: MonthlyTargetTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{monthLabel} Hedef Tablosu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((target) => {
            const progress = (target.actualValue / target.targetValue) * 100
            const isAchieved = progress >= 100
            const formatFn = target.unit === 'TRY' ? formatCurrency : formatNumber

            return (
              <div key={target.metricName}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{target.metricName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatFn(target.actualValue)} / {formatFn(target.targetValue)}
                      {target.unit !== 'TRY' && ` ${target.unit}`}
                    </span>
                    <Badge variant={isAchieved ? 'success' : progress >= 80 ? 'warning' : 'destructive'}>
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAchieved ? 'bg-green-500' : progress >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
