import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCompactCurrency } from '@/utils/format'
import { Trophy } from 'lucide-react'
import type { CohortRow } from '@/types/cohort'

interface CohortTopFirmsProps {
  rows: CohortRow[]
}

export function CohortTopFirms({ rows }: CohortTopFirmsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <Card key={row.goLiveMonth}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {row.goLiveMonth} ({row.firmCount} firma)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {row.topFirms.slice(0, 3).map((firm, idx) => (
                <div key={firm.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                      {idx + 1}
                    </Badge>
                    <span className="text-sm font-medium">{firm.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCompactCurrency(firm.gpv)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
