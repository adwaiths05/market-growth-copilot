'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Layers, Zap, Database, Brain } from 'lucide-react'

const architectureComponents = [
  {
    icon: Brain,
    name: 'LLM Analysis',
    description: 'GPT-4 powered product analysis with LangGraph orchestration',
  },
  {
    icon: Zap,
    name: 'Task Queue',
    description: 'Celery-based distributed task processing for async analysis',
  },
  {
    icon: Database,
    name: 'Data Store',
    description: 'PostgreSQL database for job history and analysis results',
  },
  {
    icon: Layers,
    name: 'API Layer',
    description: 'FastAPI backend with RESTful endpoints and real-time polling',
  },
]

export function ArchitecturePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">System Architecture</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Hover over components to learn more
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {architectureComponents.map((component) => (
            <HoverCard key={component.name}>
              <HoverCardTrigger asChild>
                <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <component.icon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{component.name}</span>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{component.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {component.description}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
