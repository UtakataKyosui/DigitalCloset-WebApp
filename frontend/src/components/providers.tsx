'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/use-auth'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}