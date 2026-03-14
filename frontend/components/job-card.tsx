'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAnalysisStatus } from '@/hooks/use-analysis-status'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface JobCardProps {
  job_id: string
  product_url: string
  created_at: string
}

export function JobCard({ job_id, product_url, created_at }: JobCardProps) {
  const { data: status, isLoading } = useAnalysisStatus(job_id)

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-status-running" />
    if (status?.status === 'completed') return <CheckCircle2 className="w-5 h-5 text-success" />
    if (status?.status === 'failed') return <AlertCircle className="w-5 h-5 text-destructive" />
    return <Loader2 className="w-5 h-5 animate-spin text-status-running" />
  }

  const getStatusBadgeClass = () => {
    if (status?.status === 'completed') return 'status-completed'
    if (status?.status === 'failed') return 'status-failed'
    return 'status-running'
  }

  const getActionLink = () => {
    if (status?.status === 'completed') {
      return `/report/${job_id}`
    }
    return `/analysis/${job_id}`
  }

  return (
    <div className="card-premium p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className={`status-badge ${getStatusBadgeClass()}`}>
              {status?.status || 'pending'}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="font-medium text-sm truncate">{product_url}</p>
            <p className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {status?.status === 'processing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono">{status.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-status-running to-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <Link href={getActionLink()} className="w-full">
        <Button size="sm" className="w-full interactive-hover" variant="outline">
          {status?.status === 'completed' ? 'View Report' : 'View Analysis'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  )
}
