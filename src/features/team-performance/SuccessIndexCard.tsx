import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TeamSuccessIndex } from '@/types/team'

interface SuccessIndexCardProps {
  data: TeamSuccessIndex
}

export function SuccessIndexCard({ data }: SuccessIndexCardProps) {
  const getColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Ekip Başarı Endeksi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
          <span className={`text-5xl font-bold ${getColor(data.overallScore)}`}>
            {data.overallScore}
          </span>
          <span className="text-xl text-muted-foreground">/100</span>
        </div>

        <div className="space-y-3">
          {data.metrics.map((metric) => (
            <div key={metric.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{metric.label}</span>
                <span className="font-medium">{metric.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
