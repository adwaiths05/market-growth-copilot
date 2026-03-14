'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalysisStatus } from '@/hooks/use-analysis-status'
import { PipelineVisualization } from '@/components/pipeline-visualization'
import { ExecutionTimeline } from '@/components/execution-timeline'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ job_id: string }>
}

export default function AnalysisPage({ params }: PageProps) {
  const router = useRouter()
  const jobId = (params as any).job_id // For demo purposes during loading

  const { data: status, isLoading, error } = useAnalysisStatus(jobId)

  // Auto-redirect when analysis is complete
  useEffect(() => {
    if (status?.status === 'completed') {
      toast.success('Analysis completed! Redirecting to report...')
      setTimeout(() => {
        router.push(`/report/${jobId}`)
      }, 1000)
    }
  }, [status?.status, jobId, router])

  // Handle failed status
  const handleResume = async () => {
    try {
      toast.loading('Resuming analysis...')
      // Resume logic would go here
      toast.success('Analysis resumed')
    } catch (err) {
      toast.error('Failed to resume analysis')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Analysis in Progress</h1>
            <p className="text-sm text-muted-foreground font-mono">{jobId}</p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong> {(error as Error).message}
            </p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visualization */}
          <div className="lg:col-span-2">
            <PipelineVisualization status={status} isLoading={isLoading} />
          </div>

          {/* Timeline */}
          <div>
            <ExecutionTimeline status={status} isLoading={isLoading} />
          </div>
        </div>

        {/* Failed State Actions */}
        {status?.status === 'failed' && (
          <div className="flex justify-center">
            <Button onClick={handleResume} size="lg">
              Resume Analysis
            </Button>
          </div>
        )}

        {/* Status Info */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold capitalize">{status?.status || 'pending'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-sm font-semibold">{status?.progress ?? 0}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Events</p>
              <p className="text-sm font-semibold">{status?.events?.length ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
