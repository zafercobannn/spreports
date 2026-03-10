import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import type { TargetStatus } from '@/types/targets'

interface StatusBadgeProps {
  status: TargetStatus
}

const STATUS_CONFIG: Record<TargetStatus, { label: string; variant: 'success' | 'destructive'; icon: typeof Check }> = {
  live: { label: 'Canlıda', variant: 'success', icon: Check },
  'not-live': { label: 'Canlı Değil', variant: 'destructive', icon: X },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
