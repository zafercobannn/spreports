import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  duration?: number
  decimals?: number
}

export function useCountUp(target: number, { duration = 1100, decimals = 0 }: UseCountUpOptions = {}): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(target) || target === 0) {
      setValue(target)
      return
    }
    let raf = 0
    let start: number | null = null
    const tick = (t: number) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  if (decimals === 0) return Math.round(value)
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
