import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LockKeyhole, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAuth } from './AdminAuthProvider'

export function AdminLoginExperience() {
  const { isLoading, signIn, signOut, userEmail } = useAdminAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(42,99,115,0.2),transparent_60%)]" />
        <div className="mx-auto max-w-xl">
          <Card className="border-white/80 bg-white/72 p-8 shadow-[0_36px_80px_-52px_rgba(23,48,57,0.72)] backdrop-blur-xl sm:p-10">
            <Skeleton className="mb-6 h-8 w-44 rounded-full" />
            <Skeleton className="mb-4 h-12 w-64 rounded-2xl" />
            <Skeleton className="mb-6 h-12 w-full rounded-2xl" />
            <Skeleton className="h-11 w-44 rounded-2xl" />
          </Card>
        </div>
      </div>
    )
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await signIn()
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
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Giriş yap</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Dashboard'a erişmek için yetkili @ikas.com hesabınla Google üzerinden giriş yap.
                </p>
              </div>
            </div>

            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {userEmail && (
              <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Oturumda şu an <span className="font-semibold">{userEmail}</span> hesabı var. Bu hesap yetkili
                değilse çıkış yapıp farklı hesapla devam et.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                size="lg"
                className="min-w-44 rounded-2xl px-6"
                disabled={isSubmitting}
                onClick={() => {
                  void handleGoogleSignIn()
                }}
              >
                <GoogleMark className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Giriş yapılıyor' : 'Google ile giriş yap'}
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

            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" />
              Erişim yalnızca yetkili @ikas.com hesaplarına açıktır.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
