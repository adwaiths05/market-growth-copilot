'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'

interface StoredJob {
  job_id: string
  product_url: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<StoredJob[]>([])

  useEffect(() => {
    // Check authentication on mount
    if (!api.getIsAuthenticated()) {
      router.push('/login')
      return
    }

    const stored = localStorage.getItem('analysis_jobs')
    if (stored) {
      setJobs(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Track and manage your product analyses
            </p>
          </div>
          <Link href="/">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Job History */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating a new analysis from the home page
              </p>
              <Link href="/">
                <Button>
                  Create First Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job, index) => (
                <JobCard
                  key={`${job.job_id}-${job.created_at}-${index}`}
                  job_id={job.job_id}
                  product_url={job.product_url}
                  created_at={job.created_at}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {jobs.length} {/* Would need to track actual completed status */}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
