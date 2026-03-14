'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIRecommendation } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { EvidenceModal } from '@/components/evidence-modal'
import { Lightbulb } from 'lucide-react'

interface AIRecommendationsPanelProps {
  recommendations: AIRecommendation[]
}

export function AIRecommendationsPanel({
  recommendations,
}: AIRecommendationsPanelProps) {
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Recommendations
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {recommendations.length} strategic recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recommendations available
              </p>
            ) : (
              recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Impact Score:{' '}
                      <span className="font-semibold text-foreground">
                        {(rec.impact_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRec(rec)}
                    >
                      View Evidence
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRec && (
        <EvidenceModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}
    </>
  )
}
