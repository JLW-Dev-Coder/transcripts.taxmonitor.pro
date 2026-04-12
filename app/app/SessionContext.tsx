'use client'

import { createContext, useContext } from 'react'

export interface AppSession {
  email: string
  accountId: string
  balance: number
  plan: string
}

const SessionContext = createContext<AppSession | null>(null)

export function SessionProvider({ session, children }: { session: AppSession; children: React.ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useAppSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useAppSession must be used within SessionProvider')
  return ctx
}
