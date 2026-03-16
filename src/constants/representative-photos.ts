/**
 * Temsilci adı → fotoğraf yolu eşleştirmesi.
 * Fotoğraflar `public/images/` altında.
 * Eşleştirme ismin herhangi bir parçasına göre yapılır (büyük/küçük harf duyarsız).
 */
const namePhotoMap: Record<string, string> = {
  'tolga': '/images/tolga.jpg',
  'hüseyin': '/images/huseyin.jpg',
  'onur': '/images/onur.jpg',
  'dilşad': '/images/dilsad.jpg',
}

export function getRepresentativePhoto(name: string): string | undefined {
  if (!name) return undefined
  const parts = name.toLocaleLowerCase('tr-TR').split(/\s+/)
  for (const part of parts) {
    const match = namePhotoMap[part]
    if (match) return match
  }
  return undefined
}
