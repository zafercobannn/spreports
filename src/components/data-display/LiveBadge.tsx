interface LiveBadgeProps {
  label?: string
}

export function LiveBadge({ label = 'Canlı' }: LiveBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-surface-muted px-2 py-[3px] text-[11px] font-medium text-muted-foreground">
      <span className="lin-pulse inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
      {label}
    </span>
  )
}
