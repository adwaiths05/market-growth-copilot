// Analysis Job Types
export interface AnalysisJob {
  job_id: string;
  product_url: string;
  created_at: string;
}

export interface AnalysisStatus {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error_message?: string;
  events?: PipelineEvent[];
}

export interface PipelineEvent {
  timestamp: string;
  event_type: string;
  description: string;
  duration_ms?: number;
}

export interface AnalysisResult {
  job_id: string;
  product_url: string;
  market_analysis: {
    market_size: number;
    growth_rate: number;
    competition_level: string;
  };
  cost_metrics: CostMetrics;
  kpi_metrics: KPIMetrics;
  ai_recommendations: AIRecommendation[];
  competitor_insights: CompetitorInsight[];
  render_strategies: RenderStrategy[];
  raw_telemetry: Record<string, unknown>;
}

export interface CostMetrics {
  revenue_potential: number;
  cost_of_goods: number;
  marketing_budget: number;
  operational_cost: number;
}

export interface KPIMetrics {
  conversion_rate: number;
  avg_order_value: number;
  customer_acquisition_cost: number;
  lifetime_value: number;
  market_penetration: number;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact_score: number;
  evidence: CompetitorInsight[];
}

export interface CompetitorInsight {
  competitor_name: string;
  strategy: string;
  market_share: number;
  effectiveness: number;
}

export interface RenderStrategy {
  name: string;
  description: string;
  estimated_roi: number;
  implementation_time: string;
}

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
}

export interface PingMetrics {
  latency_ms: number;
  timestamp: string;
}

export interface TelemetryData {
  job_id: string;
  pipeline_events: PipelineEvent[];
  resource_usage: {
    cpu_percent: number;
    memory_mb: number;
    duration_ms: number;
  };
}
