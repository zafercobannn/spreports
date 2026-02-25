import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'Gösterilecek veri yok' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <InboxIcon className="mb-3 h-12 w-12 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
