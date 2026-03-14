export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-2">Tech Stack</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
              <li>• Next.js 16</li>
              <li>• React 19</li>
              <li>• TypeScript</li>
              <li>• TailwindCSS</li>
              <li>• React Query</li>
              <li>• Recharts</li>
              <li>• shadcn/ui</li>
              <li>• FastAPI Backend</li>
            </ul>
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">API Documentation</a>
            <a href="#" className="hover:text-foreground">GitHub</a>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-6 text-xs text-muted-foreground text-center">
          <p>AI Marketplace Analysis Dashboard • Built with v0</p>
        </div>
      </div>
    </footer>
  )
}
