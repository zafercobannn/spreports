import { create } from 'zustand'
import {
  appendFirmNote,
  loadAllFirmNotes,
  loadFirmNotes,
  removeFirmNote,
} from '@/services/firebase/firm-notes-service'
import type { FirmNote } from '@/types/firm-notes'

interface FirmNotesState {
  notesByFirm: Record<string, FirmNote[]>
  loadingByFirm: Record<string, boolean>
  errorByFirm: Record<string, string | null>
  savingByFirm: Record<string, boolean>
  hasLoadedAll: boolean
  isLoadingAll: boolean

  loadAll: () => Promise<void>
  loadNotes: (firmName: string) => Promise<void>
  saveNote: (firmName: string, body: string) => Promise<void>
  deleteNote: (firmName: string, noteId: string) => Promise<void>
  clearError: (firmName: string) => void
}

export const useFirmNotesStore = create<FirmNotesState>((set, get) => ({
  notesByFirm: {},
  loadingByFirm: {},
  errorByFirm: {},
  savingByFirm: {},
  hasLoadedAll: false,
  isLoadingAll: false,

  loadAll: async () => {
    if (get().isLoadingAll || get().hasLoadedAll) return
    set({ isLoadingAll: true })
    try {
      const docs = await loadAllFirmNotes()
      const next: Record<string, FirmNote[]> = {}
      for (const d of docs) {
        next[d.firmName] = d.notes
      }
      set((s) => ({
        notesByFirm: { ...next, ...s.notesByFirm },
        hasLoadedAll: true,
        isLoadingAll: false,
      }))
    } catch {
      set({ isLoadingAll: false })
    }
  },

  loadNotes: async (firmName) => {
    set((s) => ({
      loadingByFirm: { ...s.loadingByFirm, [firmName]: true },
      errorByFirm: { ...s.errorByFirm, [firmName]: null },
    }))
    try {
      const doc = await loadFirmNotes(firmName)
      set((s) => ({
        notesByFirm: { ...s.notesByFirm, [firmName]: doc?.notes ?? [] },
        loadingByFirm: { ...s.loadingByFirm, [firmName]: false },
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Notlar yüklenemedi.'
      set((s) => ({
        loadingByFirm: { ...s.loadingByFirm, [firmName]: false },
        errorByFirm: { ...s.errorByFirm, [firmName]: message },
      }))
    }
  },

  saveNote: async (firmName, body) => {
    set((s) => ({
      savingByFirm: { ...s.savingByFirm, [firmName]: true },
      errorByFirm: { ...s.errorByFirm, [firmName]: null },
    }))
    try {
      const note = await appendFirmNote(firmName, body)
      const previous = get().notesByFirm[firmName] ?? []
      set((s) => ({
        notesByFirm: { ...s.notesByFirm, [firmName]: [note, ...previous] },
        savingByFirm: { ...s.savingByFirm, [firmName]: false },
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Not kaydedilemedi.'
      set((s) => ({
        savingByFirm: { ...s.savingByFirm, [firmName]: false },
        errorByFirm: { ...s.errorByFirm, [firmName]: message },
      }))
      throw error
    }
  },

  deleteNote: async (firmName, noteId) => {
    const previous = get().notesByFirm[firmName] ?? []
    // Optimistic remove
    set((s) => ({
      notesByFirm: {
        ...s.notesByFirm,
        [firmName]: previous.filter((n) => n.id !== noteId),
      },
    }))
    try {
      await removeFirmNote(firmName, noteId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Not silinemedi.'
      // Rollback
      set((s) => ({
        notesByFirm: { ...s.notesByFirm, [firmName]: previous },
        errorByFirm: { ...s.errorByFirm, [firmName]: message },
      }))
      throw error
    }
  },

  clearError: (firmName) =>
    set((s) => ({ errorByFirm: { ...s.errorByFirm, [firmName]: null } })),
}))
