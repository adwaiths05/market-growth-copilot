'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPIMetrics, CostMetrics } from '@/lib/types'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface RadarChartDisplayProps {
  kpiMetrics: KPIMetrics
  costMetrics: CostMetrics
}

export function RadarChartDisplay({
  kpiMetrics,
  costMetrics,
}: RadarChartDisplayProps) {
  const safeKpiMetrics: KPIMetrics = {
    conversion_rate: kpiMetrics?.conversion_rate ?? 0,
    avg_order_value: kpiMetrics?.avg_order_value ?? 0,
    customer_acquisition_cost: kpiMetrics?.customer_acquisition_cost ?? 0,
    lifetime_value: kpiMetrics?.lifetime_value ?? 0,
    market_penetration: kpiMetrics?.market_penetration ?? 0,
  }

  const data = [
    {
      metric: 'Conversion',
      value: Math.min(safeKpiMetrics.conversion_rate * 100, 100),
    },
    {
      metric: 'AOV',
      value: Math.min((safeKpiMetrics.avg_order_value / 1000) * 100, 100),
    },
    {
      metric: 'CAC Efficiency',
      value: Math.min(
        100 - (safeKpiMetrics.customer_acquisition_cost / 100) * 10,
        100
      ),
    },
    {
      metric: 'LTV',
      value: Math.min((safeKpiMetrics.lifetime_value / 5000) * 100, 100),
    },
    {
      metric: 'Market Share',
      value: Math.min(safeKpiMetrics.market_penetration * 100, 100),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Radar</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          5-axis market performance metrics
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <PolarGrid stroke="hsl(var(--muted))" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(59 89.8% 50.8%)"
              fill="hsl(59 89.8% 50.8%)"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
