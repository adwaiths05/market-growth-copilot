"use client";

import { useState, useEffect } from "react";
import { analysisApi, JobResponse } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CheckCircle2, AlertCircle, Rocket, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Polling Effect: Automatically refresh status until job is terminal
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (job && !['completed', 'failed'].includes(job.status)) {
      pollInterval = setInterval(async () => {
        try {
          const updatedJob = await analysisApi.getJobStatus(job.job_id);
          setJob(updatedJob);
        } catch (error) {
          console.error("Polling failed:", error);
        }
      }, 3000); // 3-second intervals
    }

    return () => clearInterval(pollInterval);
  }, [job]);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const initialJob = await analysisApi.startAnalysis(url);
      setJob(initialJob);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground">Deploy our agentic swarm to optimize your marketplace presence.</p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleRunAnalysis} className="flex flex-col md:flex-row gap-4">
        <input
          type="url"
          required
          placeholder="Paste Amazon or Shopify product URL..."
          className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button 
  size="lg" 
  // Convert potential null/undefined to a strict boolean for the 'disabled' prop
  disabled={!!isSubmitting || (!!job && !['completed', 'failed'].includes(job.status))}
>
  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
  Execute Pipeline
</Button>
      </form>

      {/* Active Job Progress */}
      {job && (
        <div className="grid gap-6">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold capitalize">Status: {job.status}</h2>
                <p className="text-sm text-muted-foreground font-mono">{job.job_id}</p>
              </div>
              {job.status === 'completed' ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : job.status === 'failed' ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['researching', 'analyzed', 'optimized', 'completed'].map((step) => (
                <div 
                  key={step}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium p-2 rounded-md border",
                    job.status === step ? "bg-primary/10 border-primary text-primary" : "opacity-50"
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full", job.status === step ? "bg-primary animate-pulse" : "bg-muted")} />
                  <span className="capitalize">{step}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Results Display */}
          {job.status === 'completed' && job.analysis_result && (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="rounded-xl border p-6 space-y-4">
                <div className="flex items-center gap-2 font-bold text-lg"><BarChart3 className="h-5 w-5" /> Market Metrics</div>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(job.analysis_result.agent_analysis?.metrics, null, 2)}
                </pre>
              </div>

              <div className="rounded-xl border p-6 space-y-4">
                <div className="flex items-center gap-2 font-bold text-lg"><ShieldCheck className="h-5 w-5" /> Critic Approval</div>
                <p className="text-sm italic text-muted-foreground border-l-4 pl-4">
                  "{job.analysis_result.agent_analysis?.critic_review}"
                </p>
              </div>

              <div className="md:col-span-2 rounded-xl border bg-primary text-primary-foreground p-8">
                <h3 className="text-2xl font-bold mb-4">Growth Strategy</h3>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap opacity-90">
                  {job.analysis_result.agent_analysis?.growth_strategy}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}