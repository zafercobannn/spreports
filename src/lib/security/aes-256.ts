const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const keyInput = import.meta.env.VITE_AES_256_KEY?.trim() ?? ''

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/^0x/, '')
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16)
  }
  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function deriveKeyBytes(raw: string): Promise<Uint8Array> {
  if (!raw) {
    throw new Error('AES anahtarı bulunamadı. VITE_AES_256_KEY gerekli.')
  }

  if (/^[a-fA-F0-9]{64}$/.test(raw)) {
    return hexToBytes(raw)
  }

  try {
    const bytes = base64ToBytes(raw)
    if (bytes.length === 32) return bytes
  } catch {
    // base64 değilse fallback ile devam edilir
  }

  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(raw))
  return new Uint8Array(digest)
}

let cachedKeyPromise: Promise<CryptoKey> | null = null

async function getCryptoKey(): Promise<CryptoKey> {
  if (!cachedKeyPromise) {
    cachedKeyPromise = deriveKeyBytes(keyInput).then((keyBytes) =>
      crypto.subtle.importKey(
        'raw',
        toArrayBuffer(keyBytes),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      )
    )
  }

  return cachedKeyPromise
}

export function isAes256Enabled(): boolean {
  return keyInput.length > 0
}

export async function encryptJsonAES256<T>(payload: T): Promise<string> {
  const key = await getCryptoKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plainBytes = textEncoder.encode(JSON.stringify(payload))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plainBytes,
  )
  const cipherBytes = new Uint8Array(encrypted)
  const merged = new Uint8Array(iv.length + cipherBytes.length)
  merged.set(iv, 0)
  merged.set(cipherBytes, iv.length)
  return bytesToBase64(merged)
}

export async function decryptJsonAES256<T>(encryptedPayload: string): Promise<T> {
  const merged = base64ToBytes(encryptedPayload)
  const iv = merged.slice(0, 12)
  const cipher = merged.slice(12)

  const key = await getCryptoKey()
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher,
  )

  return JSON.parse(textDecoder.decode(new Uint8Array(decrypted))) as T
}
