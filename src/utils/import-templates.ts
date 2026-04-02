import { isRepresentativeCsatPeriod } from '@/features/team-performance/representative-success-utils'

type CsvCell = string | number | boolean

interface CsvTemplateDefinition {
  filename: string
  headers: string[]
  sampleRow: CsvCell[]
}

function escapeCsvCell(value: CsvCell): string {
  const text = typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : String(value)

  if (/[;"\n,]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function buildCsvContent(definition: CsvTemplateDefinition): string {
  return [definition.headers, definition.sampleRow]
    .map((row) => row.map(escapeCsvCell).join(';'))
    .join('\n')
}

export function downloadCsvTemplate(definition: CsvTemplateDefinition): void {
  if (typeof window === 'undefined') return

  const csvContent = `\uFEFF${buildCsvContent(definition)}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = definition.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function downloadPlatformTemplate(mode: 'sp' | 'premium'): void {
  downloadCsvTemplate({
    filename: mode === 'sp' ? 'sp-platform-import-sablonu.csv' : 'premium-onboarding-platform-import-sablonu.csv',
    headers: ['Altyapı', 'Adet'],
    sampleRow: ['Shopify', 12],
  })
}

export function downloadTopFirmsTemplate(): void {
  downloadCsvTemplate({
    filename: 'top-firmalar-import-sablonu.csv',
    headers: ['Mağaza', 'GPV', 'Önceki Ay GPV', 'Gönderi', 'ikas Kargo Paket Adedi', 'PARS', 'PWI'],
    sampleRow: ['Örnek Mağaza', 125000, 98000, 420, 260, true, false],
  })
}

export function downloadRepresentativeTemplate(options?: { year: number; month: number }): void {
  const usesCsatModel = options ? isRepresentativeCsatPeriod(options.year, options.month) : false

  downloadCsvTemplate({
    filename: 'temsilci-basari-import-sablonu.csv',
    headers: [
      'Temsilci',
      'Canlıya Alınan Hesap Sayısı',
      'Canlıya Alınan Hesap Sayısı Hedefi',
      usesCsatModel ? 'Audit Puan' : 'Audit Puanı',
      usesCsatModel ? 'CSAT (CALL + Toplantı Değerlendirmesi + Mail)' : 'NPS Anket Skoru',
      'Ortalama Canlıya Alma Süresi (gün)',
      ...(usesCsatModel ? [] : ['Toplantı Değerlendirmesi']),
      'Görsel URL',
    ],
    sampleRow: usesCsatModel
      ? ['Örnek Temsilci', 18, 20, 92, 4.7, 5.2, 'https://example.com/gorsel.jpg']
      : ['Örnek Temsilci', 18, 20, 92, 4.7, 5.2, 4.5, 'https://example.com/gorsel.jpg'],
  })
}
