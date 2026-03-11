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
          ? 'rounded-[1.4rem] border border-destructive/20 bg-[rgba(255,244,246,0.88)] px-4 py-3 text-sm text-destructive shadow-[0_18px_34px_-28px_rgba(193,69,87,0.35)]'
          : 'rounded-[1.4rem] border border-emerald-200/70 bg-[rgba(242,251,246,0.9)] px-4 py-3 text-sm text-emerald-800 shadow-[0_18px_34px_-28px_rgba(67,138,96,0.25)]'
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
