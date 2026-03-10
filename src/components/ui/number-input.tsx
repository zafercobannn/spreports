import { useEffect, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
  emptyValue?: number
}

function formatValue(value: number): string {
  return Number.isFinite(value) ? String(value) : ''
}

function parseValue(raw: string): number | null {
  const normalized = raw.replace(',', '.').trim()
  if (!normalized) return null

  const parsed = Number(normalized)
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
      type="number"
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
