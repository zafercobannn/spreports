import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore'
import {
  getFirebaseDb,
  isFirebaseSyncEnabled,
  requireSignedInFirebaseUser,
} from '@/lib/firebase/firebase-app'
import type { FirmNote, FirmNotesDocument } from '@/types/firm-notes'
import { getFirmId } from '@/types/firm-notes'

const COLLECTION = 'firm_notes'

interface FirestoreFirmNotesDocument {
  firmName: string
  notes: FirmNote[]
  updatedAt: number | FieldValue
}

function makeNoteId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export async function loadAllFirmNotes(): Promise<FirmNotesDocument[]> {
  if (!isFirebaseSyncEnabled) return []
  requireSignedInFirebaseUser()

  const ref = collection(getFirebaseDb(), COLLECTION)
  const snapshot = await getDocs(ref)
  return snapshot.docs.map((d) => {
    const data = d.data() as FirestoreFirmNotesDocument
    return {
      firmName: data.firmName ?? d.id,
      notes: Array.isArray(data.notes) ? data.notes : [],
      updatedAt:
        typeof data.updatedAt === 'number'
          ? data.updatedAt
          : Date.now(),
    }
  })
}

export async function loadFirmNotes(firmName: string): Promise<FirmNotesDocument | null> {
  if (!isFirebaseSyncEnabled) return null
  requireSignedInFirebaseUser()

  const id = getFirmId(firmName)
  const ref = doc(getFirebaseDb(), COLLECTION, id)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null

  const data = snapshot.data() as FirestoreFirmNotesDocument
  return {
    firmName: data.firmName ?? firmName,
    notes: Array.isArray(data.notes) ? data.notes : [],
    updatedAt:
      typeof data.updatedAt === 'number'
        ? data.updatedAt
        : Date.now(),
  }
}

export async function appendFirmNote(
  firmName: string,
  body: string,
): Promise<FirmNote> {
  if (!isFirebaseSyncEnabled) {
    throw new Error('Firebase senkronizasyonu kapalı.')
  }
  const user = requireSignedInFirebaseUser()

  const trimmed = body.trim()
  if (!trimmed) {
    throw new Error('Boş not kaydedilemez.')
  }

  const id = getFirmId(firmName)
  const ref = doc(getFirebaseDb(), COLLECTION, id)
  const existing = await getDoc(ref)
  const previous = existing.exists()
    ? ((existing.data() as FirestoreFirmNotesDocument).notes ?? [])
    : []

  const note: FirmNote = {
    id: makeNoteId(),
    body: trimmed,
    authorEmail: user.email ?? '',
    authorName: user.displayName ?? undefined,
    createdAt: Date.now(),
  }

  const next: FirestoreFirmNotesDocument = {
    firmName,
    notes: [note, ...previous],
    updatedAt: serverTimestamp(),
  }

  await setDoc(ref, next, { merge: false })
  return note
}

export async function removeFirmNote(firmName: string, noteId: string): Promise<void> {
  if (!isFirebaseSyncEnabled) {
    throw new Error('Firebase senkronizasyonu kapalı.')
  }
  requireSignedInFirebaseUser()

  const id = getFirmId(firmName)
  const ref = doc(getFirebaseDb(), COLLECTION, id)
  const existing = await getDoc(ref)
  if (!existing.exists()) return

  const previous = (existing.data() as FirestoreFirmNotesDocument).notes ?? []
  const next: FirestoreFirmNotesDocument = {
    firmName,
    notes: previous.filter((n) => n.id !== noteId),
    updatedAt: serverTimestamp(),
  }

  await setDoc(ref, next, { merge: false })
}
