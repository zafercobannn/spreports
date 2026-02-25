# SP Reports Dashboard

React + TypeScript + Vite tabanlı yönetim ve sunum dashboard'u.

## Kurulum

```bash
npm install
npm run dev
```

Üretim build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayıp doldurun.

Zorunlu Firebase değişkenleri:

- `VITE_ENABLE_FIREBASE_SYNC`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

AES-256 şifreleme:

- `VITE_AES_256_KEY` (64 hex veya güçlü passphrase)

## Veri Mimarisi

- Dashboard verisi period bazında tutulur: `dashboard_periods/{YYYY-MM}`
- Temsilci başarı verileri alt koleksiyondadır:
  `dashboard_periods/{YYYY-MM}/representatives/{representativeId}`
- Temsilci görselleri Firebase Storage altında saklanır:
  `representative-images/{YYYY-MM}/...`

## Maliyet Odaklı Sorgu Yapısı

- Prefix search: `normalizedName` alanı üzerinden (`startAt/endAt`) çalışır.
- Skor filtreleme: `successIndex` alanı üzerinden `where + orderBy + limit`.
- Payload alanlarının index'leri kapatıldı:
  `payload`, `securePayload` alanları `firestore.indexes.json` içinde override edildi.

## Güvenlik

- Uygulama tarafında AES-256-GCM ile veri şifreleme desteği var.
- Örnek Firestore ve Storage rules dosyaları:
  - `firestore.rules`
  - `storage.rules`

Not: Bu rules dosyaları admin claim (`request.auth.token.admin`) varsayımıyla hazırlandı.
Projede authentication/claim atama tarafını da aktif etmeniz gerekir.
