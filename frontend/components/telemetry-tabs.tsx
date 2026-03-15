'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TelemetryData, RenderStrategy, AnalysisResult } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TelemetryTabsProps {
  telemetry: TelemetryData | undefined
  renderStrategies?: RenderStrategy[]
  costMetrics?: AnalysisResult['cost_metrics']
  isLoading: boolean
}

export function TelemetryTabs({
  telemetry,
  renderStrategies,
  costMetrics,
  isLoading,
}: TelemetryTabsProps) {
  const safeCostMetrics: AnalysisResult['cost_metrics'] = {
    revenue_potential: costMetrics?.revenue_potential ?? 0,
    cost_of_goods: costMetrics?.cost_of_goods ?? 0,
    marketing_budget: costMetrics?.marketing_budget ?? 0,
    operational_cost: costMetrics?.operational_cost ?? 0,
  }

  const safeRenderStrategies = renderStrategies ?? []
  const timelineData =
    telemetry?.pipeline_events?.map((event) => ({
      name: event.event_type,
      duration: event.duration_ms || 0,
    })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Analysis Data</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
            <TabsTrigger value="economics">Economics</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Render Strategies</h4>
              {safeRenderStrategies.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No render strategies available
                </p>
              ) : (
                <div className="grid gap-2">
                  {safeRenderStrategies.map((strategy, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded-lg text-xs">
                      <p className="font-medium">{strategy.name}</p>
                      <p className="text-muted-foreground">{strategy.description}</p>
                      <div className="flex gap-2 mt-1 text-muted-foreground">
                        <span>ROI: {(strategy.estimated_roi * 100).toFixed(0)}%</span>
                        <span>Time: {strategy.implementation_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Telemetry Tab */}
          <TabsContent value="telemetry" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Pipeline Duration</h4>
              {timelineData.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No telemetry data available
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip />
                    <Bar dataKey="duration" fill="hsl(59 89.8% 50.8%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {telemetry?.resource_usage && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">CPU</p>
                  <p className="font-semibold">{telemetry.resource_usage.cpu_percent.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Memory</p>
                  <p className="font-semibold">{telemetry.resource_usage.memory_mb.toFixed(0)}MB</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Time</p>
                  <p className="font-semibold">{(telemetry.resource_usage.duration_ms / 1000).toFixed(1)}s</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Raw Data Tab */}
          <TabsContent value="raw" className="space-y-2">
            <pre className="p-3 bg-muted rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(telemetry, null, 2)}
            </pre>
          </TabsContent>

          {/* Unit Economics Tab */}
          <TabsContent value="economics" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Revenue Potential</p>
                <p className="text-lg font-semibold">
                  ${safeCostMetrics.revenue_potential.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">COGS</p>
                <p className="text-lg font-semibold">
                  ${safeCostMetrics.cost_of_goods.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Marketing Budget</p>
                <p className="text-lg font-semibold">
                  ${safeCostMetrics.marketing_budget.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Operational Cost</p>
                <p className="text-lg font-semibold">
                  ${safeCostMetrics.operational_cost.toFixed(2)}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
