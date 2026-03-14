import {
  AnalysisStatus,
  AnalysisResult,
  HealthCheck,
  PingMetrics,
  TelemetryData,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 30000; // 30 second timeout

class APIClient {
  private async fetchWithTimeout<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API error: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("Failed to connect to API server");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getHealth(): Promise<HealthCheck> {
    return this.fetchWithTimeout<HealthCheck>("/health");
  }

  async pingMetrics(): Promise<PingMetrics> {
    return this.fetchWithTimeout<PingMetrics>("/ping");
  }

  async startAnalysis(productUrl: string): Promise<{ job_id: string }> {
    return this.fetchWithTimeout<{ job_id: string }>("/analyze", {
      method: "POST",
      body: JSON.stringify({ product_url: productUrl }),
    });
  }

  async getAnalysisStatus(jobId: string): Promise<AnalysisStatus> {
    return this.fetchWithTimeout<AnalysisStatus>(`/status/${jobId}`);
  }

  async resumeAnalysis(jobId: string): Promise<{ job_id: string }> {
    return this.fetchWithTimeout<{ job_id: string }>(`/resume/${jobId}`, {
      method: "POST",
    });
  }

  async getAnalysisResult(jobId: string): Promise<AnalysisResult> {
    return this.fetchWithTimeout<AnalysisResult>(`/result/${jobId}`);
  }

  async getTelemetry(jobId: string): Promise<TelemetryData> {
    return this.fetchWithTimeout<TelemetryData>(`/telemetry/${jobId}`);
  }

  async approveAnalysis(jobId: string): Promise<{ status: string }> {
    return this.fetchWithTimeout<{ status: string }>(`/approve/${jobId}`, {
      method: "POST",
    });
  }
}

export const api = new APIClient();
