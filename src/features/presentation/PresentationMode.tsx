import { useEffect } from 'react'
import { usePresentationStore } from '@/stores/presentation-store'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useFullscreen } from '@/hooks/use-fullscreen'
import { PresentationControls } from './PresentationControls'
import { NarratorPanel } from './NarratorPanel'
import { cn } from '@/lib/utils'
import { MonthlyOverviewTab } from '@/features/monthly-overview/MonthlyOverviewTab'
import { MonthlyComparisonTab } from '@/features/monthly-comparison/MonthlyComparisonTab'
import { CohortTab } from '@/features/cohort/CohortTab'
import { TopFirmsTab } from '@/features/top-firms/TopFirmsTab'
import { RealizedTargetsTab } from '@/features/targets/RealizedTargetsTab'
import { XMonthTargetTab } from '@/features/targets/XMonthTargetTab'
import { TeamPerformanceTab } from '@/features/team-performance/TeamPerformanceTab'

const SLIDES = [
  {
    id: 'overview',
    title: 'Aylık Genel Bakış',
    component: MonthlyOverviewTab,
    notes: 'Bu slayt aylık GPV metriklerini, canlı hesap sayılarını ve premium onboarding verilerini göstermektedir.',
  },
  {
    id: 'comparison',
    title: 'Önceki Ay Karşılaştırma',
    component: MonthlyComparisonTab,
    notes: 'Seçili ay ile bir önceki ay arasında GPV, Shikas ve en az bir kez ödeme almış SP sayısı karşılaştırılır.',
  },
  {
    id: 'cohort',
    title: 'Cohort Analizi',
    component: CohortTab,
    notes: 'Cohort analizi canlıya alınan ay bazında GPV büyümesini göstermektedir. Yeşil tonların koyulaşması GPV artışını ifade eder.',
  },
  {
    id: 'top-firms',
    title: 'Top 15 Firma',
    component: TopFirmsTab,
    notes: 'En yüksek GPV üreten 15 firma ve onların kargo kullanımları, paket dağılımları burada listelenmiştir.',
  },
  {
    id: 'realized-targets',
    title: 'Gerçekleşen Hedef',
    component: RealizedTargetsTab,
    notes: 'Bir önceki ay hedeflenen markalardan canlıya alınan firmalar bu slaytta yer alır.',
  },
  {
    id: 'x-month-target',
    title: 'Bir Sonraki Ay Hedef',
    component: XMonthTargetTab,
    notes: 'Seçili aya göre bir sonraki ay canlıya alınması hedeflenen marka, sektör ve tahmini ciro planı bu slayttadır.',
  },
  {
    id: 'team',
    title: 'Ekip Performans',
    component: TeamPerformanceTab,
    notes: 'Temsilci başarı endeksi, ortalama canlıya alma süresi trend grafiği ve bireysel performans tabloları bu slayttadır.',
  },
]

export function PresentationMode() {
  const {
    mode,
    currentSlideIndex,
    autoPlayEnabled,
    autoPlayInterval,
    nextSlide,
    previousSlide,
    exitPresentation,
    setTotalSlides,
  } = usePresentationStore()

  const { ref, enterFullscreen, exitFullscreen } = useFullscreen()

  useEffect(() => {
    setTotalSlides(SLIDES.length)
  }, [setTotalSlides])

  useEffect(() => {
    if (mode !== 'off') {
      enterFullscreen()
    }
  }, [mode, enterFullscreen])

  useKeyboard(
    {
      ArrowRight: nextSlide,
      ArrowLeft: previousSlide,
      ' ': nextSlide,
      Escape: () => {
        exitFullscreen()
        exitPresentation()
      },
    },
    mode !== 'off',
  )

  useEffect(() => {
    if (!autoPlayEnabled || mode === 'off') return
    const timer = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(timer)
  }, [autoPlayEnabled, autoPlayInterval, mode, nextSlide])

  if (mode === 'off') return null

  const currentSlide = SLIDES[currentSlideIndex]
  const SlideComponent = currentSlide?.component

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      <div className={cn('flex-1 overflow-auto p-8', mode === 'narrator' && 'h-[70vh]')}>
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">{currentSlide?.title}</h2>
        </div>
        {SlideComponent && <SlideComponent />}
      </div>

      {mode === 'narrator' && (
        <NarratorPanel
          notes={currentSlide?.notes}
          className="h-[30vh] border-t border-zinc-700"
        />
      )}

      <PresentationControls />
    </div>
  )
}
