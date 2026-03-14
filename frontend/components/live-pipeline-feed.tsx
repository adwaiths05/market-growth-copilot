'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StoredJob {
  job_id: string
  product_url: string
  created_at: string
}

export function LivePipelineFeed() {
  const [jobs, setJobs] = useState<StoredJob[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('analysis_jobs')
    if (stored) {
      setJobs(JSON.parse(stored).slice(0, 5)) // Show last 5 jobs
    }
  }, [])

  const { data: statuses, isLoading } = useQuery({
    queryKey: ['pipeline-statuses', jobs],
    queryFn: async () => {
      if (!jobs.length) return []
      const results = await Promise.all(
        jobs.map((job) => api.getAnalysisStatus(job.job_id).catch(() => null))
      )
      return results.filter(Boolean)
    },
    refetchInterval: 2000, // Poll every 2s
    enabled: jobs.length > 0,
  })

  if (!jobs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No analyses in progress. Submit a product URL to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Live Pipeline Feed</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time status updates from recent analyses
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, idx) => {
              const status = statuses?.[idx]
              return (
                <div
                  key={job.job_id}
                  className="p-3 border rounded-lg bg-muted/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      {job.job_id.slice(0, 8)}
                    </span>
                    <div className="flex items-center gap-2">
                      {status?.status === 'processing' && (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      )}
                      <span className="text-xs font-medium capitalize">
                        {status?.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {job.product_url}
                  </p>
                  {status?.progress !== undefined && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
