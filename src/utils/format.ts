const tryCurrencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const trNumberFormatter = new Intl.NumberFormat('tr-TR')

const trPercentFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number): string {
  return tryCurrencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return trNumberFormatter.format(value)
}

export function formatPercent(value: number): string {
  return trPercentFormatter.format(value / 100)
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} K`
  }
  return trNumberFormatter.format(value)
}

export function formatDuration(days: number): string {
  return `${Math.round(days)} gun`
}

export type MetricFormat = 'currency' | 'number' | 'percentage' | 'compact' | 'duration'

export function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'number':
      return formatNumber(value)
    case 'percentage':
      return formatPercent(value)
    case 'compact':
      return formatCompactNumber(value)
    case 'duration':
      return formatDuration(value)
  }
}
