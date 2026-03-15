'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalysisStatus } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface ExecutionTimelineProps {
  status: AnalysisStatus | undefined
  isLoading: boolean
}

export function ExecutionTimeline({ status, isLoading }: ExecutionTimelineProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/30 p-6">
        <h3 className="text-lg font-semibold mb-4">Execution Timeline</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const events = status?.events || []

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/30 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Execution Timeline</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {events.length} events recorded
        </p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No events recorded yet. Analysis is starting...
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="flex gap-4 pb-3 last:pb-0 border-l border-border pl-4">
                {/* Timeline marker */}
                <div className="flex flex-col items-center -ml-6">
                  <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-card mt-1" />
                </div>

                {/* Event content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold capitalize">
                        {event.event_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="tech-log">
                      {format(new Date(event.timestamp), 'HH:mm:ss')}
                    </span>
                    {event.duration_ms && (
                      <span className="tech-log">
                        {event.duration_ms}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
