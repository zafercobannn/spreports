import { cn } from '@/lib/utils'

interface AdminSectionChipItem {
  id: string
  label: string
}

interface AdminSectionChipsProps {
  items: readonly AdminSectionChipItem[]
  activeId: string
  onSelect: (id: string) => void
}

export function AdminSectionChips({ items, activeId, onSelect }: AdminSectionChipsProps) {
  return (
    <div className="surface-shell overflow-x-auto px-3 py-2">
      <div className="flex min-w-max items-center gap-2">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_14px_24px_-18px_rgba(42,99,115,0.75)]'
                  : 'border-white/80 bg-white/70 text-foreground hover:border-primary/22 hover:bg-white',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
