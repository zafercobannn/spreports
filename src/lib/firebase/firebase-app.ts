import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function readEnv(name: string): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

const requiredFields = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
}

const missingFirebaseConfigKeys = Object.entries(requiredFields)
  .filter(([, value]) => !value)
  .map(([key]) => key)

const syncFlag = import.meta.env.VITE_ENABLE_FIREBASE_SYNC !== 'false'
export const isFirebaseSyncEnabled = syncFlag && missingFirebaseConfigKeys.length === 0
export const firebaseConfigErrors = missingFirebaseConfigKeys

let appInstance: ReturnType<typeof initializeApp> | null = null
let firestoreInstance: ReturnType<typeof getFirestore> | null = null
let storageInstance: ReturnType<typeof getStorage> | null = null

function ensureApp() {
  if (!isFirebaseSyncEnabled) {
    throw new Error(
      missingFirebaseConfigKeys.length > 0
        ? `Firebase yapılandırması eksik: ${missingFirebaseConfigKeys.join(', ')}`
        : 'Firebase sync devre dışı. VITE_ENABLE_FIREBASE_SYNC ayarını kontrol et.',
    )
  }

  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  }

  return appInstance
}

export function getFirebaseDb() {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(ensureApp())
  }
  return firestoreInstance
}

export function getFirebaseStorageInstance() {
  if (!storageInstance) {
    storageInstance = getStorage(ensureApp())
  }
  return storageInstance
}
