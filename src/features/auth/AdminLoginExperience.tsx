import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, LockKeyhole, LogOut, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAuth } from './AdminAuthProvider'

const inputClassName =
  'h-12 w-full rounded-2xl border border-white/70 bg-white/85 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/90 focus:border-primary/55 focus:ring-4 focus:ring-primary/15'

export function AdminLoginExperience() {
  const { isLoading, signIn, signOut, primaryAdminEmail, userEmail } = useAdminAuth()
  const [email, setEmail] = useState(primaryAdminEmail)
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail)
      return
    }

    if (primaryAdminEmail) {
      setEmail(primaryAdminEmail)
    }
  }, [primaryAdminEmail, userEmail])

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(42,99,115,0.2),transparent_60%)]" />
        <div className="mx-auto max-w-xl">
          <Card className="border-white/80 bg-white/72 p-8 shadow-[0_36px_80px_-52px_rgba(23,48,57,0.72)] backdrop-blur-xl sm:p-10">
            <Skeleton className="mb-6 h-8 w-44 rounded-full" />
            <Skeleton className="mb-4 h-12 w-64 rounded-2xl" />
            <Skeleton className="mb-3 h-12 w-full rounded-2xl" />
            <Skeleton className="mb-3 h-12 w-full rounded-2xl" />
            <Skeleton className="mb-6 h-12 w-full rounded-2xl" />
            <Skeleton className="h-11 w-44 rounded-2xl" />
          </Card>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await signIn(email, password)
      setPassword('')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Giriş işlemi tamamlanamadı.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(42,99,115,0.28),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(119,188,138,0.28)_0%,transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(61,141,134,0.22)_0%,transparent_72%)] blur-2xl" />

      <div className="mx-auto max-w-xl">
        <Card className="border-white/85 bg-white/78 p-8 shadow-[0_36px_80px_-52px_rgba(23,48,57,0.72)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-white/65 px-3 py-1 text-[11px] tracking-[0.2em] uppercase">
                Yetkili Üyelik
              </Badge>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Admin girişi</h2>
              </div>
            </div>

            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Email
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  className={`${inputClassName} pl-11`}
                  placeholder={primaryAdminEmail || 'email@domain.com'}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Şifre
              </span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`${inputClassName} pl-11`}
                  placeholder="Şifreni gir"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            {userEmail && userEmail !== primaryAdminEmail && (
              <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Oturumda şu an <span className="font-semibold">{userEmail}</span> hesabı var. Bu hesap yetkili değilse
                çıkış yapıp farklı hesapla devam et.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="min-w-44 rounded-2xl px-6"
                disabled={isSubmitting}
              >
                <LockKeyhole className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Giriş yapılıyor' : 'Yönetici olarak giriş yap'}
              </Button>

              {userEmail && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-2xl px-6"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Farklı hesap kullan
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
