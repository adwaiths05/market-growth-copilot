'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AIRecommendation } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface EvidenceModalProps {
  recommendation: AIRecommendation
  onClose: () => void
}

export function EvidenceModal({
  recommendation,
  onClose,
}: EvidenceModalProps) {
  return (
    <Dialog open={!!recommendation} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recommendation.title} - Supporting Evidence</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {recommendation.description}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Competitor Insights</h4>
            {recommendation.evidence && recommendation.evidence.length > 0 ? (
              <div className="grid gap-2">
                {recommendation.evidence.map((insight, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {insight.competitor_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {insight.strategy}
                      </p>
                      <div className="flex gap-4 text-xs mt-2">
                        <span>
                          Market Share:{' '}
                          <span className="font-semibold">
                            {(insight.market_share * 100).toFixed(1)}%
                          </span>
                        </span>
                        <span>
                          Effectiveness:{' '}
                          <span className="font-semibold">
                            {(insight.effectiveness * 100).toFixed(0)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No competitor insights available
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Impact Score: {(recommendation.impact_score * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
