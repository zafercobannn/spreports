import { useEffect, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
  emptyValue?: number
}

const displayFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function formatValue(value: number): string {
  if (!Number.isFinite(value)) return ''
  return displayFormatter.format(value)
}

function parseValue(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (trimmed.includes(',') && trimmed.includes('.')) {
    const normalized = trimmed.replace(/\./g, '').replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (trimmed.includes(',')) {
    const parsed = Number(trimmed.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }

  const dotCount = (trimmed.match(/\./g) ?? []).length
  if (dotCount > 1) {
    const parsed = Number(trimmed.replace(/\./g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }

  if (dotCount === 1 && /^\d{1,3}\.\d{3}$/.test(trimmed)) {
    const parsed = Number(trimmed.replace('.', ''))
    return Number.isFinite(parsed) ? parsed : null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function NumberInput({
  className,
  value,
  onValueChange,
  emptyValue = 0,
  onFocus,
  onBlur,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState(() => formatValue(value))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setDraft(formatValue(value))
    }
  }, [isFocused, value])

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={draft}
      className={cn(className)}
      onFocus={(event) => {
        setIsFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setIsFocused(false)

        const parsed = parseValue(draft)
        if (parsed === null) {
          onValueChange(emptyValue)
          setDraft(formatValue(emptyValue))
        } else {
          if (parsed !== value) {
            onValueChange(parsed)
          }
          setDraft(formatValue(parsed))
        }

        onBlur?.(event)
      }}
      onChange={(event) => {
        const nextDraft = event.target.value
        setDraft(nextDraft)

        const parsed = parseValue(nextDraft)
        if (parsed !== null) {
          onValueChange(parsed)
        }
      }}
    />
  )
}
