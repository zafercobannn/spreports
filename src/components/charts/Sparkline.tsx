import { useEffect, useRef } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
  fill?: boolean
}

export function Sparkline({
  data,
  width = 240,
  height = 28,
  strokeWidth = 1.25,
  className,
  fill = true,
}: SparklineProps) {
  const pathRef = useRef<SVGPathElement | null>(null)

  if (!data || data.length < 2) {
    return <svg width={width} height={height} className={className} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i): [number, number] => [
    i * step,
    height - ((v - min) / range) * (height - 4) - 2,
  ])
  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  const areaD = `${d} L ${width} ${height} L 0 ${height} Z`

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const length = el.getTotalLength?.() ?? width * 2
    el.style.transition = 'none'
    el.style.strokeDasharray = String(length)
    el.style.strokeDashoffset = String(length)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!el) return
        el.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(.22,1,.36,1)'
        el.style.strokeDashoffset = '0'
      })
    })
  }, [data, width])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: 'block' }}
    >
      {fill && <path d={areaD} fill="currentColor" opacity={0.12} />}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
