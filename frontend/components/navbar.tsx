'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ThemeToggle } from '@/components/theme-toggle'
import { api } from '@/lib/api'
import { useLatency } from '@/hooks/use-latency'
import { Button } from '@/components/ui/button'
import { CircleCheck, CircleAlert, Loader2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { CommandPalette } from '@/components/command-palette'
import { toast } from 'sonner'

export function Navbar() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.getIsAuthenticated())
  }, [])

  const handleLogout = () => {
    api.logout()
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
    router.push('/')
  }
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 10000, // Poll every 10s
  })

  const { data: ping } = useLatency()

  const isHealthy = health?.status === 'healthy' || health?.status === 'ok'

  const getHealthColor = () => {
    if (healthLoading) return 'text-warning'
    if (isHealthy) return 'text-success'
    if (health?.status === 'degraded') return 'text-warning'
    return 'text-destructive'
  }

  const getHealthIcon = () => {
    if (healthLoading) return <Loader2 className="w-4 h-4 animate-spin" />
    if (isHealthy) return <CircleCheck className="w-4 h-4" />
    return <CircleAlert className="w-4 h-4" />
  }

  return (
    <nav className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg hover:text-primary transition-colors">
            AI Marketplace
          </Link>

          {/* Metrics */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center text-sm">
            <div className={`flex items-center gap-2 ${getHealthColor()} transition-colors`}>
              {getHealthIcon()}
              <span className="capitalize font-medium">
                {isHealthy ? 'Healthy' : (health?.status || 'unknown')}
              </span>
            </div>
            {ping && typeof ping.latency_ms === 'number' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Latency:</span>
                <span className="tech-log font-semibold">{ping.latency_ms} ms</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
            <CommandPalette />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
