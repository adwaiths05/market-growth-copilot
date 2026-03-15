'use client'

import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

interface Insight {
  id: string
  title: string
  description: string
  metric?: string
  color?: 'primary' | 'accent' | 'success' | 'warning'
}

interface InsightsCarouselProps {
  insights: Insight[]
  loading?: boolean
}

export function InsightsCarousel({ insights, loading }: InsightsCarouselProps) {
  const colorMap = {
    primary: 'border-primary/30 bg-primary/5',
    accent: 'border-accent/30 bg-accent/5',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
  }

  if (loading) {
    return (
      <div className="horizontal-scroll flex gap-4 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="insight-card bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="horizontal-scroll flex gap-4 pb-4">
      {insights.map((insight, index) => (
        <motion.div
          key={insight.id}
          className={`insight-card border ${colorMap[insight.color || 'primary']}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm line-clamp-2">{insight.title}</h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-3">
            {insight.description}
          </p>

          {insight.metric && (
            <div className="pt-3 border-t border-border/20">
              <p className="metric-label">Impact Score</p>
              <p className="metric-display text-lg">{insight.metric}</p>
            </div>
          )}
        </motion.div>
      ))}

      {insights.length === 0 && (
        <div className="w-full py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No insights available yet. Run an analysis to generate insights.
          </p>
        </div>
      )}
    </div>
  )
}
