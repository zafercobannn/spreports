/**
 * Temsilci adı → fotoğraf yolu eşleştirmesi.
 *
 * Fotoğrafları `public/photos/` altına koyun.
 * Anahtar olarak temsilcinin tam adını (büyük/küçük harf duyarsız) kullanın.
 *
 * Örnek:
 *   "Ahmet Yılmaz" → "/photos/ahmet-yilmaz.jpg"
 */
const photoMap: Record<string, string> = {
  // 'Temsilci Adı': '/photos/dosya-adi.jpg',
}

const normalizedMap = new Map(
  Object.entries(photoMap).map(([name, url]) => [name.toLocaleLowerCase('tr-TR'), url]),
)

export function getRepresentativePhoto(name: string): string | undefined {
  return normalizedMap.get(name.toLocaleLowerCase('tr-TR'))
}
