import { ProductUrlForm } from '@/components/product-url-form'
import { LivePipelineFeed } from '@/components/live-pipeline-feed'
import { ArchitecturePanel } from '@/components/architecture-panel'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)' }}
        />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-pretty">
              AI-Powered Product Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Analyze e-commerce products with advanced AI insights. Get market analysis,
              cost metrics, and strategic recommendations powered by LLMs and LangGraph.
            </p>
          </div>

          {/* Main Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <div className="card-premium p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Start Analysis</h2>
                  <ProductUrlForm />
                </div>
                <div className="card-premium">
                  <ArchitecturePanel />
                </div>
              </div>
            </div>

            {/* Pipeline Feed */}
            <div className="lg:col-span-2">
              <div className="card-premium">
                <LivePipelineFeed />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card-premium p-6 space-y-3 animate-float" style={{ animationDelay: '0s' }}>
              <h3 className="font-semibold text-lg">Market Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get insights into market size, growth rates, and competitive landscape for any product.
              </p>
            </div>
            <div className="card-premium p-6 space-y-3 animate-float" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-semibold text-lg">Cost Metrics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Analyze revenue potential, COGS, marketing budgets, and operational costs with AI-powered recommendations.
              </p>
            </div>
            <div className="card-premium p-6 space-y-3 animate-float" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-semibold text-lg">AI Recommendations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive actionable strategies backed by competitor analysis and market data from LLM processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
