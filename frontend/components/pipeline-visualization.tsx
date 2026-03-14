'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AnalysisStatus } from '@/lib/types'
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'

interface PipelineVisualizationProps {
  status: AnalysisStatus | undefined
  isLoading: boolean
}

const PIPELINE_STAGES = [
  { id: 'validation', name: 'URL Validation' },
  { id: 'scraping', name: 'Data Scraping' },
  { id: 'analysis', name: 'AI Analysis' },
  { id: 'generation', name: 'Report Generation' },
]

export function PipelineVisualization({
  status,
  isLoading,
}: PipelineVisualizationProps) {
  const getStageStatus = (stageId: string) => {
    if (!status?.events) return 'pending'

    const event = status.events.find((e) => e.event_type === stageId)
    if (!event) return 'pending'

    return 'completed'
  }

  const getStageIcon = (stageStatus: string, isPending: boolean) => {
    if (isPending) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    if (stageStatus === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (status?.status === 'failed') return <AlertCircle className="w-5 h-5 text-red-600" />
    return <Clock className="w-5 h-5 text-muted-foreground" />
  }

  const currentStageIndex = PIPELINE_STAGES.findIndex(
    (stage) => getStageStatus(stage.id) === 'pending'
  )

  return (
    <div className="card-premium p-6">
      <div className="space-y-8">
        {/* AI Workflow Timeline */}
        <div className="space-y-4">
          {PIPELINE_STAGES.map((stage, index) => {
            const stageStatus = getStageStatus(stage.id)
            const isPending = currentStageIndex === index && status?.status === 'processing'

            return (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className={`pipeline-node w-10 h-10 flex items-center justify-center ${isPending ? 'running' : stageStatus === 'completed' ? 'completed' : ''}`}>
                    {getStageIcon(stageStatus, isPending)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{stage.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {isPending ? 'Processing...' : stageStatus}
                    </p>
                  </div>
                </div>

                {/* Gradient connector line */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="ml-5 h-6 border-l-2 border-gradient-to-b from-primary to-transparent" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="metric-label">Overall Progress</p>
            <span className="metric-display text-lg">{status?.progress ?? 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary via-accent to-primary h-3 rounded-full transition-all duration-500 shadow-lg shadow-primary/50"
              style={{ width: `${status?.progress ?? 0}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        {status?.status === 'failed' && status?.error_message && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
            <p className="text-sm text-destructive font-medium">
              <strong>Error:</strong> {status.error_message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
