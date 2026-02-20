/**
 * API Client for interacting with the Marketplace Growth Copilot backend.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// frontend/lib/api-client.ts

export interface JobResponse {
    job_id: string;
    product_url: string;
    status: 'pending' | 'started' | 'researching' | 'analyzed' | 'optimized' | 'completed' | 'failed';
    analysis_result?: {
      plan?: string | null;
      raw_research?: string[] | null;
      agent_analysis?: {
        metrics?: any | null;
        growth_strategy?: string | null;
        critic_review?: string | null;
      } | null;
    } | null;
    error_message?: string | null;
    created_at: string;
  }

export const analysisApi = {
  /**
   * Triggers the multi-agent pipeline for a specific product URL.
   */
  async startAnalysis(productUrl: string): Promise<JobResponse> {
    const response = await fetch(`${API_BASE}/analysis/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_url: productUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to start analysis");
    }

    return response.json();
  },

  /**
   * Polls the status of an existing analysis job.
   */
  async getJobStatus(jobId: string): Promise<JobResponse> {
    const response = await fetch(`${API_BASE}/analysis/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch job status");
    }

    return response.json();
  }
};