import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendIndicator } from './TrendIndicator'
import { getTrendDirection } from '@/utils/calculations'

interface ComparisonCardProps {
  label: string
  currentValue: string
  previousValue: string
  currentLabel: string
  previousLabel: string
  changePercentage: number
  isPositiveGood?: boolean
}

export function ComparisonCard({
  label,
  currentValue,
  previousValue,
  currentLabel,
  previousLabel,
  changePercentage,
  isPositiveGood = true,
}: ComparisonCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{currentValue}</p>
            <p className="text-xs text-muted-foreground">{currentLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-lg text-muted-foreground">{previousValue}</p>
            <p className="text-xs text-muted-foreground">{previousLabel}</p>
          </div>
        </div>
        <div className="mt-2">
          <TrendIndicator
            value={changePercentage}
            direction={getTrendDirection(changePercentage)}
            isPositiveGood={isPositiveGood}
          />
        </div>
      </CardContent>
    </Card>
  )
}
