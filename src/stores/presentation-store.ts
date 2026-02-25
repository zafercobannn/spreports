import { create } from 'zustand'
import type { PresentationMode } from '@/types/presentation'

interface PresentationState {
  mode: PresentationMode
  currentSlideIndex: number
  totalSlides: number
  autoPlayEnabled: boolean
  autoPlayInterval: number

  enterPresentation: (mode: 'slideshow' | 'narrator') => void
  exitPresentation: () => void
  nextSlide: () => void
  previousSlide: () => void
  goToSlide: (index: number) => void
  setTotalSlides: (total: number) => void
  toggleAutoPlay: () => void
}

export const usePresentationStore = create<PresentationState>()((set, get) => ({
  mode: 'off',
  currentSlideIndex: 0,
  totalSlides: 0,
  autoPlayEnabled: false,
  autoPlayInterval: 10_000,

  enterPresentation: (mode) => set({ mode, currentSlideIndex: 0 }),
  exitPresentation: () =>
    set({ mode: 'off', currentSlideIndex: 0, autoPlayEnabled: false }),
  nextSlide: () => {
    const { currentSlideIndex, totalSlides } = get()
    if (currentSlideIndex < totalSlides - 1) {
      set({ currentSlideIndex: currentSlideIndex + 1 })
    }
  },
  previousSlide: () => {
    const { currentSlideIndex } = get()
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1 })
    }
  },
  goToSlide: (index) => set({ currentSlideIndex: index }),
  setTotalSlides: (total) => set({ totalSlides: total }),
  toggleAutoPlay: () => set((s) => ({ autoPlayEnabled: !s.autoPlayEnabled })),
}))
