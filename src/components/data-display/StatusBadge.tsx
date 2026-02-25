import { Badge } from '@/components/ui/badge'
import { Check, Clock, X } from 'lucide-react'
import type { TargetStatus } from '@/types/targets'

interface StatusBadgeProps {
  status: TargetStatus
}

const STATUS_CONFIG: Record<TargetStatus, { label: string; variant: 'success' | 'warning' | 'destructive'; icon: typeof Check }> = {
  live: { label: 'Canlıda', variant: 'success', icon: Check },
  pending: { label: 'Bekleniyor', variant: 'warning', icon: Clock },
  lost: { label: 'Kaybedildi', variant: 'destructive', icon: X },
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
