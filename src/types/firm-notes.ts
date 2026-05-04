export interface FirmNote {
  id: string
  body: string
  authorEmail: string
  authorName?: string
  createdAt: number
}

export interface FirmNotesDocument {
  firmName: string
  notes: FirmNote[]
  updatedAt: number
}

export function getFirmId(firmName: string): string {
  return firmName
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'firm'
}
