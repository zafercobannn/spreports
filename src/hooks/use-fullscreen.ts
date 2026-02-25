import { useRef, useCallback, useState, useEffect } from 'react'

export function useFullscreen() {
  const ref = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const enterFullscreen = useCallback(async () => {
    if (ref.current) {
      await ref.current.requestFullscreen()
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }, [])

  return { ref, enterFullscreen, exitFullscreen, isFullscreen }
}
