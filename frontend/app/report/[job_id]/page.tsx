'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { KPIRibbon } from '@/components/kpi-ribbon'
import { RadarChartDisplay } from '@/components/radar-chart-display'
import { AIRecommendationsPanel } from '@/components/ai-recommendations-panel'
import { TelemetryTabs } from '@/components/telemetry-tabs'
import { ActionRow } from '@/components/action-row'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ job_id: string }>
}

export default function ReportPage({ params }: PageProps) {
  const router = useRouter()
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication on mount
    if (!api.getIsAuthenticated()) {
      router.push('/login')
      return
    }

    Promise.resolve(params).then((resolvedParams) => {
      setJobId(resolvedParams.job_id)
    })
  }, [params, router])

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['analysis-result', jobId],
    queryFn: () => api.getAnalysisResult(jobId || ''),
    enabled: !!jobId,
  })

  const { data: telemetry } = useQuery({
    queryKey: ['telemetry', jobId],
    queryFn: () => api.getTelemetry(jobId || ''),
    enabled: !!jobId,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Failed to load report. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Analysis Report</h1>
            <p className="text-sm text-muted-foreground">
              {result.product_url}
            </p>
          </div>
        </div>

        {/* KPI Ribbon */}
        <KPIRibbon metrics={result.kpi_metrics} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Radar Chart */}
          <div className="lg:col-span-1">
            <RadarChartDisplay
              kpiMetrics={result.kpi_metrics}
              costMetrics={result.cost_metrics}
            />
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            <AIRecommendationsPanel
              recommendations={result.ai_recommendations}
            />
          </div>
        </div>

        {/* Telemetry Tabs */}
        <TelemetryTabs
          telemetry={telemetry}
          renderStrategies={result.render_strategies}
          costMetrics={result.cost_metrics}
          isLoading={false}
        />

        {/* Action Row */}
        <ActionRow jobId={jobId} />
      </div>
    </div>
  )
}
