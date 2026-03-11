import { Link } from 'react-router-dom'
import { LockKeyhole, LogOut, ShieldCheck, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAuth } from './AdminAuthProvider'

export function DashboardLockScreen() {
  const { isLoading, userEmail, signOut } = useAdminAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="border-white/80 bg-white/72 p-6 shadow-[0_24px_70px_-50px_rgba(23,48,57,0.8)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/20 bg-white/70 px-3 py-1 text-[11px] tracking-[0.2em] uppercase">
                  Protected Dashboard
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Admin login required
                </Badge>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Premium Onboarding Dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Yönetici oturumu olmadan metrikler gösterilmez. Admin girişine geçerek dashboard ve düzenleme
                  ekranlarının kilidini açabilirsin.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/admin">
                <Button size="lg" className="rounded-2xl px-6">
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Admin girişi
                </Button>
              </Link>
              {userEmail && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl px-6"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Hesap değiştir
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/52 p-5 shadow-[0_32px_90px_-62px_rgba(23,48,57,0.8)] backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute -left-10 top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(42,99,115,0.18)_0%,transparent_72%)] blur-2xl" />
          <div className="pointer-events-none absolute -right-10 bottom-4 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(119,188,138,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="pointer-events-none select-none space-y-5 blur-xl saturate-75">
            <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
              <Skeleton className="h-32 rounded-[1.7rem] bg-white/85" />
              <Skeleton className="h-32 rounded-[1.7rem] bg-white/85" />
              <Skeleton className="h-32 rounded-[1.7rem] bg-white/85" />
              <Skeleton className="h-32 rounded-[1.7rem] bg-white/85" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <Skeleton className="h-[380px] rounded-[1.8rem] bg-white/82" />
              <div className="space-y-4">
                <Skeleton className="h-44 rounded-[1.8rem] bg-white/82" />
                <Skeleton className="h-32 rounded-[1.8rem] bg-white/82" />
                <Skeleton className="h-32 rounded-[1.8rem] bg-white/82" />
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-xl border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(229,241,244,0.88)_100%)] p-6 text-center shadow-[0_40px_90px_-56px_rgba(23,48,57,0.82)] sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary/10 text-primary">
                {isLoading ? <Sparkles className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                {isLoading ? 'Oturum doğrulanıyor' : 'Dashboard kilitli'}
              </h2>
              {isLoading && (
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Firebase oturum durumu kontrol ediliyor. Birkaç saniye içinde erişim seviyesi netleşecek.
                </p>
              )}

              {!isLoading && (
                <div className="mt-6 space-y-3">
                  {userEmail && (
                    <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Oturumda görünen hesap: <span className="font-semibold">{userEmail}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link to="/admin">
                  <Button size="lg" className="rounded-2xl px-6">
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    Yönetici girişi
                  </Button>
                </Link>
                {userEmail && !isLoading && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl px-6"
                    onClick={() => {
                      void signOut()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış yap
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
