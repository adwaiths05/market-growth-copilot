'use client'

import { motion } from 'framer-motion'
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
    <div className="rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/30 p-6">
      <div className="space-y-8">
        {/* AI Workflow Timeline */}
        <div className="space-y-4">
          {PIPELINE_STAGES.map((stage, index) => {
            const stageStatus = getStageStatus(stage.id)
            const isPending = currentStageIndex === index && status?.status === 'running'
            const isCompleted = stageStatus === 'completed'

            return (
              <motion.div
                key={stage.id}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`pipeline-node w-10 h-10 flex items-center justify-center ${isPending ? 'running' : isCompleted ? 'completed' : ''}`}
                    animate={isPending ? {
                      boxShadow: [
                        '0 0 0 0 rgba(99, 102, 241, 0.7)',
                        '0 0 0 20px rgba(99, 102, 241, 0)',
                      ],
                    } : {}}
                    transition={isPending ? {
                      duration: 1.5,
                      repeat: Infinity,
                    } : {}}
                  >
                    {getStageIcon(stageStatus, isPending)}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{stage.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {isPending ? 'Processing...' : stageStatus}
                    </p>
                  </div>
                </div>

                {/* Animated gradient connector line */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="ml-5 h-6 relative">
                    <motion.div
                      className="absolute inset-0 border-l-2 border-primary"
                      animate={isPending ? {
                        boxShadow: [
                          '0 0 10px 0 rgba(99, 102, 241, 0.5)',
                          '0 0 20px 0 rgba(139, 92, 246, 0.3)',
                          '0 0 10px 0 rgba(99, 102, 241, 0.5)',
                        ],
                      } : {}}
                      transition={isPending ? {
                        duration: 2,
                        repeat: Infinity,
                      } : {}}
                    />
                  </div>
                )}
              </motion.div>
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
