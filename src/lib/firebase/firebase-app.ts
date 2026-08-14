import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function readEnv(name: string): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value: string): string {
  return value.trim().toLocaleLowerCase('en-US')
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID'),
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
const fallbackAdminEmails = [
  'hilal.mingin@ikas.com',
  'mali.sungur@ikas.com',
  'zafer.coban@ikas.com',
  'sinan.adan@ikas.com',
]
const adminEmailSet = new Set(
  [...fallbackAdminEmails, ...readEnv('VITE_FIREBASE_ADMIN_EMAILS').split(',')]
    .map(normalizeEmail)
    .filter(Boolean),
)

export const isFirebaseSyncEnabled = syncFlag && missingFirebaseConfigKeys.length === 0
export const firebaseConfigErrors = missingFirebaseConfigKeys
export const isFirebaseAnalyticsConfigured = firebaseConfig.measurementId.length > 0
export const firebaseAdminEmails = Array.from(adminEmailSet)
export const firebasePrimaryAdminEmail = firebaseAdminEmails[0] ?? ''

let appInstance: ReturnType<typeof initializeApp> | null = null
let firestoreInstance: ReturnType<typeof getFirestore> | null = null
let storageInstance: ReturnType<typeof getStorage> | null = null
let authInstance: Auth | null = null
let analyticsInstance: Analytics | null = null
let analyticsSupportPromise: Promise<boolean> | null = null
let analyticsReadyPromise: Promise<Analytics | null> | null = null

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

export function getFirebaseAuthInstance() {
  if (!authInstance) {
    authInstance = getAuth(ensureApp())
  }
  return authInstance
}

export function isFirebaseAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmailSet.has(normalizeEmail(email))
}

export function getCurrentFirebaseUser(): User | null {
  return getFirebaseAuthInstance().currentUser
}

export function requireSignedInFirebaseUser(): User {
  const user = getCurrentFirebaseUser()
  if (!user) {
    throw new Error('Bu alanı görüntülemek için yönetici girişi yapmalısınız.')
  }
  return user
}

export function requireAdminFirebaseUser(): User {
  const user = requireSignedInFirebaseUser()
  if (!isFirebaseAdminEmail(user.email)) {
    throw new Error('Bu hesap admin erişimine sahip değil.')
  }
  return user
}

export function observeFirebaseAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuthInstance(), callback)
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuthInstance()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const credential = await signInWithPopup(auth, provider)

  if (!isFirebaseAdminEmail(credential.user.email)) {
    await signOut(auth)
    throw new Error('Bu hesap erişim yetkisine sahip değil.')
  }

  return credential.user
}

export async function signOutFirebaseUser(): Promise<void> {
  const auth = getFirebaseAuthInstance()
  if (!auth.currentUser) return
  await signOut(auth)
}

async function isFirebaseAnalyticsSupported(): Promise<boolean> {
  if (!isFirebaseAnalyticsConfigured) return false
  if (typeof window === 'undefined') return false

  if (!analyticsSupportPromise) {
    analyticsSupportPromise = isSupported().catch(() => false)
  }

  return analyticsSupportPromise
}

export async function getFirebaseAnalyticsInstance(): Promise<Analytics | null> {
  if (!isFirebaseSyncEnabled) return null
  if (analyticsInstance) return analyticsInstance
  if (analyticsReadyPromise) return analyticsReadyPromise

  analyticsReadyPromise = (async () => {
    if (!(await isFirebaseAnalyticsSupported())) return null

    analyticsInstance = getAnalytics(ensureApp())
    return analyticsInstance
  })().finally(() => {
    analyticsReadyPromise = null
  })

  return analyticsReadyPromise
}
