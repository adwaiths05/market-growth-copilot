'use client'

import { useLatency } from '@/hooks/use-latency'

export function Footer() {
  const { data: latency } = useLatency()

  return (
    <footer className="border-t border-border bg-muted/30 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Backend Tech Stack</h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <li>• FastAPI</li>
                <li>• LangGraph</li>
                <li>• Celery</li>
                <li>• Redis</li>
                <li>• PostgreSQL</li>
                <li>• Firecrawl</li>
                <li>• SerpAPI</li>
                <li>• Mistral</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Frontend Tech Stack</h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <li>• Next.js 16</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• TailwindCSS</li>
                <li>• React Query</li>
                <li>• Recharts</li>
                <li>• shadcn/ui</li>
                <li>• next-themes</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <a href="http://127.0.0.1:8000/docs" className="hover:text-foreground transition-colors">API Documentation</a>
              <a href="https://github.com/adwaiths05/market-growth-copilot" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
            {latency && typeof latency.latency_ms === 'number' && (
              <div className="tech-log">
                API Latency: {latency.latency_ms} ms
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-6 text-xs text-muted-foreground text-center">
          <p>Marketplace Growth Copilot • AI-Powered Analysis Dashboard</p>
        </div>
      </div>
    </footer>
  )
}
