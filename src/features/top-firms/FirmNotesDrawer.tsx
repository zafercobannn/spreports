import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFirmNotesStore } from '@/stores/firm-notes-store'
import { useAdminAuth } from '@/features/auth/AdminAuthProvider'
import { cn } from '@/lib/utils'

interface FirmNotesDrawerProps {
  firmName: string | null
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function FirmNotesDrawer({ firmName, onClose }: FirmNotesDrawerProps) {
  const isOpen = firmName !== null
  const { isAdmin, userEmail } = useAdminAuth()

  const notes = useFirmNotesStore((s) => (firmName ? s.notesByFirm[firmName] : undefined))
  const isLoading = useFirmNotesStore((s) => (firmName ? s.loadingByFirm[firmName] : false) ?? false)
  const isSaving = useFirmNotesStore((s) => (firmName ? s.savingByFirm[firmName] : false) ?? false)
  const error = useFirmNotesStore((s) => (firmName ? s.errorByFirm[firmName] : null))
  const loadNotes = useFirmNotesStore((s) => s.loadNotes)
  const saveNote = useFirmNotesStore((s) => s.saveNote)
  const deleteNote = useFirmNotesStore((s) => s.deleteNote)
  const clearError = useFirmNotesStore((s) => s.clearError)

  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (firmName && notes === undefined) {
      void loadNotes(firmName)
    }
  }, [firmName, notes, loadNotes])

  useEffect(() => {
    if (firmName) setDraft('')
  }, [firmName])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!firmName || !draft.trim()) return
    try {
      await saveNote(firmName, draft.trim())
      setDraft('')
    } catch {
      // Error already captured in store
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[680px] flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out',
          'border-l border-border',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'lg:w-[50vw]',
        )}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label={firmName ? `${firmName} mağaza notları` : 'Mağaza notları'}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 pt-6 pb-5">
          <div className="space-y-1">
            <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
              Mağaza Notları
            </span>
            <h2 className="text-[24px] font-semibold tracking-tight text-foreground">
              {firmName ?? '—'}
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              {isAdmin
                ? 'Mağazaya dair tüm notları burada tutabilirsiniz.'
                : 'Yalnızca yetkili kullanıcılar not ekleyebilir.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Kapat">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && notes === undefined ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : !notes || notes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <span className="rounded-full bg-foreground/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]">
                Henüz not yok
              </span>
              <p className="max-w-xs text-[13px]">
                Bu mağaza için kaydedilmiş not bulunmuyor. Aşağıdan ilk notu ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-2xl border border-border bg-surface-warm/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {note.authorName || note.authorEmail || 'Bilinmiyor'}
                      </span>
                      <span>·</span>
                      <span className="font-mono tabular">
                        {dateFormatter.format(new Date(note.createdAt))}
                      </span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-[var(--color-danger)]"
                        onClick={() => firmName && void deleteNote(firmName, note.id)}
                        aria-label="Notu sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
                    {note.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isAdmin && (
          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-surface-muted/30 px-6 py-4"
          >
            {error && (
              <div className="mb-3 rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
                {error}
                <button
                  type="button"
                  className="ml-2 underline"
                  onClick={() => firmName && clearError(firmName)}
                >
                  Kapat
                </button>
              </div>
            )}
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                userEmail
                  ? `${userEmail} olarak not ekleyin…`
                  : 'Mağaza için not ekleyin…'
              }
              rows={4}
              className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-subtle">
                Cmd/Ctrl + Enter ile de kaydedebilirsiniz.
              </p>
              <Button
                type="submit"
                disabled={isSaving || !draft.trim()}
                className="rounded-full px-5"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Notu Kaydet
              </Button>
            </div>
            <KeyboardSubmitter onSubmit={() => draft.trim() && handleSubmit(new Event('submit') as unknown as FormEvent<HTMLFormElement>)} />
          </form>
        )}
      </aside>
    </>
  )
}

function KeyboardSubmitter({ onSubmit }: { onSubmit: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSubmit])
  return null
}
