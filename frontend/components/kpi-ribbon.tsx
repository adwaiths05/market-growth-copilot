'use client'

import { Card } from '@/components/ui/card'
import { KPIMetrics } from '@/lib/types'
import { TrendingUp } from 'lucide-react'

interface KPIRibbonProps {
  metrics?: KPIMetrics | null
}

export function KPIRibbon({ metrics }: KPIRibbonProps) {
  if (!metrics) {
    return null
  }

  const kpis = [
    {
      label: 'Conversion Rate',
      value: `${(metrics.conversion_rate * 100).toFixed(1)}%`,
      format: 'percentage',
    },
    {
      label: 'Avg Order Value',
      value: `$${metrics.avg_order_value.toFixed(2)}`,
      format: 'currency',
    },
    {
      label: 'Customer Acquisition Cost',
      value: `$${metrics.customer_acquisition_cost.toFixed(2)}`,
      format: 'currency',
    },
    {
      label: 'Lifetime Value',
      value: `$${metrics.lifetime_value.toFixed(2)}`,
      format: 'currency',
    },
    {
      label: 'Market Penetration',
      value: `${(metrics.market_penetration * 100).toFixed(1)}%`,
      format: 'percentage',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/30 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="metric-label">{kpi.label}</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="metric-display text-foreground">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}
