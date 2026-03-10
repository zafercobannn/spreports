import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import {
  firebasePrimaryAdminEmail,
  isFirebaseAdminEmail,
  observeFirebaseAuthState,
  signInWithFirebaseEmail,
  signOutFirebaseUser,
} from '@/lib/firebase/firebase-app'
import { useDashboardDataStore } from '@/stores/dashboard-data-store'

interface AdminAuthContextValue {
  user: User | null
  userEmail: string
  isLoading: boolean
  isAdmin: boolean
  primaryAdminEmail: string
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = observeFirebaseAuthState((nextUser) => {
      setUser(nextUser)
      setIsLoading(false)

      if (!nextUser || !isFirebaseAdminEmail(nextUser.email)) {
        useDashboardDataStore.getState().resetAll()
      }
    })

    return unsubscribe
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        userEmail: user?.email?.trim() ?? '',
        isLoading,
        isAdmin: isFirebaseAdminEmail(user?.email),
        primaryAdminEmail: firebasePrimaryAdminEmail,
        signIn: async (email, password) => {
          await signInWithFirebaseEmail(email, password)
        },
        signOut: async () => {
          await signOutFirebaseUser()
          useDashboardDataStore.getState().resetAll()
        },
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth yalnızca AdminAuthProvider içinde kullanılabilir.')
  }
  return context
}
