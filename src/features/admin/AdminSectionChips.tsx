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
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-1">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-black/5',
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
