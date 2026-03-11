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
    <div className="overflow-x-auto rounded-[1.6rem] border border-black/10 bg-white/60 px-3 py-2 backdrop-blur-sm">
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
                  ? 'border-primary/25 bg-primary text-primary-foreground shadow-[0_14px_24px_-18px_rgba(42,99,115,0.55)]'
                  : 'border-black/8 bg-transparent text-foreground hover:border-primary/18 hover:bg-white/80',
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
