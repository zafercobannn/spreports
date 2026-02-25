import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react'
import { usePresentationStore } from '@/stores/presentation-store'

export function PresentationControls() {
  const {
    currentSlideIndex,
    totalSlides,
    autoPlayEnabled,
    nextSlide,
    previousSlide,
    goToSlide,
    exitPresentation,
    toggleAutoPlay,
  } = usePresentationStore()

  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={previousSlide}>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlideIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={nextSlide}>
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="mx-1 h-4 w-px bg-white/30" />

      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleAutoPlay}>
        {autoPlayEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <span className="min-w-[3rem] text-center text-xs text-white/70">
        {currentSlideIndex + 1}/{totalSlides}
      </span>

      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={exitPresentation}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
