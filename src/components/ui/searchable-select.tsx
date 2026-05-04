import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptionShape {
  value: string | number
  label: string
}

interface SearchableSelectProps<T extends OptionShape> {
  value: T['value']
  onChange: (value: T['value']) => void
  options: T[]
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  placeholder?: string
  triggerClassName?: string
  popoverClassName?: string
  align?: 'left' | 'right'
  renderTrigger?: (selected: T | undefined) => ReactNode
  renderItem?: (option: T) => ReactNode
}

export function SearchableSelect<T extends OptionShape>({
  value,
  onChange,
  options,
  searchable = false,
  searchPlaceholder = 'Ara…',
  emptyMessage = 'Sonuç yok',
  placeholder = '—',
  triggerClassName,
  popoverClassName,
  align = 'left',
  renderTrigger,
  renderItem,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  const normalized = (s: string) =>
    s.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü\s]/gi, '')

  const filtered = searchable && search.trim()
    ? options.filter((o) => normalized(o.label).includes(normalized(search)))
    : options

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-hover',
          open && 'border-foreground/30',
          triggerClassName,
        )}
      >
        {renderTrigger ? renderTrigger(selected) : <span>{selected?.label ?? placeholder}</span>}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-2 min-w-full overflow-hidden rounded-2xl border border-border bg-surface',
            'shadow-[0_24px_64px_-24px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.04)]',
            align === 'right' ? 'right-0' : 'left-0',
            popoverClassName,
          )}
        >
          {searchable && (
            <div className="border-b border-border p-2">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted/60 px-3 py-2 focus-within:border-foreground/30">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-[12px] text-muted-foreground">{emptyMessage}</li>
            )}
            {filtered.map((opt) => {
              const isSelected = opt.value === value
              return (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors',
                      isSelected
                        ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent-text)]'
                        : 'text-foreground hover:bg-hover',
                    )}
                  >
                    <span className="truncate">{renderItem ? renderItem(opt) : opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
