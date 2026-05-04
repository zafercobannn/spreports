import { useMemo } from 'react'
import type { RadarPoint } from './comparison-utils'

interface RadarCompareChartProps {
  points: RadarPoint[]
  leftLabel: string
  rightLabel: string
  size?: number
}

export function RadarCompareChart({ points, leftLabel, rightLabel, size = 360 }: RadarCompareChartProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 48
  const n = points.length

  const axisAngle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const pointAt = (i: number, valuePct: number) => {
    const angle = axisAngle(i)
    const r = (valuePct / 100) * radius
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  }

  const labelAt = (i: number) => {
    const angle = axisAngle(i)
    const r = radius + 22
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  }

  const polygon = (key: 'leftValue' | 'rightValue') =>
    points
      .map((p, i) => {
        const { x, y } = pointAt(i, p[key])
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

  const rings = useMemo(
    () =>
      [0.25, 0.5, 0.75, 1].map((scale) =>
        points
          .map((_, i) => {
            const angle = axisAngle(i)
            const r = scale * radius
            const x = cx + Math.cos(angle) * r
            const y = cy + Math.sin(angle) * r
            return `${x.toFixed(1)},${y.toFixed(1)}`
          })
          .join(' '),
      ),
    [points.length, radius, cx, cy], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const axisLines = points.map((_, i) => {
    const { x, y } = pointAt(i, 100)
    return { x1: cx, y1: cy, x2: x, y2: y }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Rings */}
        {rings.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--color-border-strong)"
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeDasharray={i === rings.length - 1 ? '0' : '2 4'}
          />
        ))}
        {/* Axis lines */}
        {axisLines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="var(--color-border-strong)"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
        ))}
        {/* Right polygon (background, foreground) */}
        <polygon
          points={polygon('rightValue')}
          fill="rgba(26, 26, 29, 0.16)"
          stroke="#1a1a1d"
          strokeWidth={2}
        />
        {/* Left polygon (lime accent on top) */}
        <polygon
          points={polygon('leftValue')}
          fill="rgba(224, 255, 64, 0.32)"
          stroke="#a8c428"
          strokeWidth={2}
        />
        {/* Vertices */}
        {points.map((p, i) => {
          const { x: lx, y: ly } = pointAt(i, p.leftValue)
          const { x: rx, y: ry } = pointAt(i, p.rightValue)
          return (
            <g key={i}>
              <circle cx={lx} cy={ly} r={4} fill="#a8c428" stroke="#fff" strokeWidth={1.5} />
              <circle cx={rx} cy={ry} r={4} fill="#1a1a1d" stroke="#fff" strokeWidth={1.5} />
            </g>
          )
        })}
        {/* Axis labels */}
        {points.map((p, i) => {
          const { x, y } = labelAt(i)
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono"
              fontSize={11}
              fill="var(--color-foreground)"
              style={{ fontWeight: 600 }}
            >
              {p.label}
            </text>
          )
        })}
      </svg>

      <div className="flex items-center gap-5 text-[12px]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#a8c428]" />
          <span className="font-medium text-foreground">{leftLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a1a1d]" />
          <span className="font-medium text-foreground">{rightLabel}</span>
        </div>
      </div>
    </div>
  )
}
