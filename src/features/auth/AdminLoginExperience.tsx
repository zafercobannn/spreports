import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, LockKeyhole, LogOut, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAuth } from './AdminAuthProvider'

const inputClassName =
  'h-12 w-full rounded-2xl border border-white/70 bg-white/85 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/90 focus:border-primary/55 focus:ring-4 focus:ring-primary/15'

const featureItems = [
  'Tüm dashboard sekmeleri yönetici oturumu olmadan kilitli tutulur.',
  'Firebase Auth ile doğrulanan hesaplar doğrudan admin erişimi alır.',
  'Veri akışı Firestore ve Storage üzerinde korumalı şekilde çalışır.',
]

const trustItems = [
  { label: 'Kilitli Erişim', value: 'Yalnızca admin hesaplar' },
  { label: 'Senkronizasyon', value: 'Firestore + Storage' },
  { label: 'Oturum Tipi', value: 'Email / Password' },
]

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
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="min-h-[620px] overflow-hidden border-white/75 bg-white/55 p-8">
            <Skeleton className="mb-6 h-6 w-32 rounded-full" />
            <Skeleton className="mb-4 h-20 w-full rounded-3xl" />
            <Skeleton className="mb-8 h-5 w-4/5 rounded-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
            </div>
          </Card>
          <Card className="border-white/80 bg-white/72 p-8">
            <Skeleton className="mb-6 h-8 w-44 rounded-full" />
            <Skeleton className="mb-3 h-12 w-full rounded-2xl" />
            <Skeleton className="mb-3 h-12 w-full rounded-2xl" />
            <Skeleton className="mb-6 h-12 w-full rounded-2xl" />
            <Skeleton className="h-11 w-36 rounded-2xl" />
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

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="relative overflow-hidden border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,0.88)_0%,rgba(225,239,243,0.76)_48%,rgba(210,231,236,0.88)_100%)] p-8 sm:p-10">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(42,99,115,0.18)_0%,transparent_72%)]" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(119,188,138,0.18)_0%,transparent_70%)]" />

          <div className="relative space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-primary/20 bg-white/65 px-3 py-1 text-[11px] tracking-[0.22em] uppercase">
                Premium Onboarding
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Admin Access Layer
              </Badge>
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Üyelik Girişi</h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Admin bölümüne girildiğinde e-posta doğrulamalı oturum ekranı açılır. Yetkisiz hesaplar
                dashboard verisine erişemez, diğer ekranlar kilitli kalır.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {trustItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.65rem] border border-white/80 bg-white/70 p-4 shadow-[0_24px_60px_-48px_rgba(23,48,57,0.75)] backdrop-blur-sm"
                >
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.8rem] border border-white/80 bg-[#14343d] p-6 text-white shadow-[0_40px_80px_-54px_rgba(10,28,34,0.95)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] text-white/70 uppercase">Koruma Katmanı</p>
                  <p className="text-lg font-semibold">Admin oturumu olmadan veri render edilmiyor.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {featureItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/84">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#77bc8a]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-white/85 bg-white/78 p-8 shadow-[0_36px_80px_-52px_rgba(23,48,57,0.72)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-white/65 px-3 py-1 text-[11px] tracking-[0.2em] uppercase">
                Yetkili Üyelik
              </Badge>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Admin girişi</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Firebase üzerinde tanımlı yönetici hesabınla oturum aç.
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

            {primaryAdminEmail && (
              <div className="rounded-2xl border border-primary/12 bg-primary/6 px-4 py-3 text-sm text-primary">
                Yetkili hesap: <span className="font-semibold">{primaryAdminEmail}</span>
              </div>
            )}

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
