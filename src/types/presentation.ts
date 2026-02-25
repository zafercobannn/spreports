import type { ComponentType } from 'react'

export type PresentationMode = 'off' | 'slideshow' | 'narrator'

export interface SlideDefinition {
  id: string
  title: string
  component: ComponentType<SlideProps>
  narratorNotes?: string
  duration?: number
}

export interface SlideProps {
  isActive: boolean
  isPresentation: boolean
}
