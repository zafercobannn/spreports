import { cn } from '@/lib/utils'
import { usePresentationStore } from '@/stores/presentation-store'

interface NarratorPanelProps {
  notes?: string
  className?: string
}

export function NarratorPanel({ notes, className }: NarratorPanelProps) {
  const { currentSlideIndex, totalSlides } = usePresentationStore()

  return (
    <div className={cn('bg-zinc-900 text-zinc-100 p-6 overflow-y-auto', className)}>
      <div className="flex gap-8">
        <div className="flex-1">
          <h3 className="mb-2 text-sm font-semibold text-zinc-400">Anlatıcı Notları</h3>
          <p className="text-lg leading-relaxed">
            {notes ?? 'Bu slayt için not bulunmuyor.'}
          </p>
        </div>
        <div className="flex w-32 flex-col items-center gap-1">
          <span className="text-3xl font-bold">{currentSlideIndex + 1}</span>
          <span className="text-xs text-zinc-400">/ {totalSlides}</span>
        </div>
      </div>
    </div>
  )
}
