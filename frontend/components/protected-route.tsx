'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = api.getIsAuthenticated()
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [router])

  return <>{children}</>
}
