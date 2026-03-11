import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface AdminInlineStatusProps {
  message?: string | null
  tone: 'success' | 'error'
}

export function AdminInlineStatus({ message, tone }: AdminInlineStatusProps) {
  if (!message) return null

  const isError = tone === 'error'
  const Icon = isError ? AlertTriangle : CheckCircle2

  return (
    <div
      className={
        isError
          ? 'rounded-2xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive'
          : 'rounded-2xl border border-emerald-200/70 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-800'
      }
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="font-medium">{message}</p>
      </div>
    </div>
  )
}
