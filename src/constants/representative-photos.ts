/**
 * Temsilci ilk adı → fotoğraf yolu eşleştirmesi.
 * Fotoğraflar `public/images/` altında.
 * Eşleştirme ilk isme göre yapılır (büyük/küçük harf duyarsız).
 */
const firstNamePhotoMap: Record<string, string> = {
  'tolga': '/images/tolga.jpg',
  'hüseyin': '/images/huseyin.jpg',
  'onur': '/images/onur.jpg',
  'dilşad': '/images/dilsad.jpg',
}

function normalizeFirstName(fullName: string): string {
  return (fullName.split(/\s+/)[0] ?? '').toLocaleLowerCase('tr-TR')
}

export function getRepresentativePhoto(name: string): string | undefined {
  const firstName = normalizeFirstName(name)
  if (!firstName) return undefined
  return firstNamePhotoMap[firstName]
}
