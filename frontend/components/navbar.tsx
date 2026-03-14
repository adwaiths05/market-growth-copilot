'use client'

import { useQuery } from '@tanstack/react-query'
import { ThemeToggle } from '@/components/theme-toggle'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { CircleCheck, CircleAlert, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CommandPalette } from '@/components/command-palette'

export function Navbar() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 10000, // Poll every 10s
  })

  const { data: ping } = useQuery({
    queryKey: ['ping'],
    queryFn: () => api.pingMetrics(),
    refetchInterval: 10000, // Poll every 10s
  })

  const getHealthColor = () => {
    if (healthLoading) return 'text-warning'
    if (health?.status === 'healthy') return 'text-success'
    if (health?.status === 'degraded') return 'text-warning'
    return 'text-destructive'
  }

  const getHealthIcon = () => {
    if (healthLoading) return <Loader2 className="w-4 h-4 animate-spin" />
    if (health?.status === 'healthy') return <CircleCheck className="w-4 h-4" />
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
                {health?.status || 'unknown'}
              </span>
            </div>
            {ping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Latency:</span>
                <span className="tech-log font-semibold">{ping.latency_ms}ms</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
