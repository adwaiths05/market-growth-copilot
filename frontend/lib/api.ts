import {
  AnalysisStatus,
  AnalysisResult,
  HealthCheck,
  PingMetrics,
  TelemetryData,
  LoginRequest,
  LoginResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 30000; // 30 second timeout
const TOKEN_KEY = "mgc_token";

class APIClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  }

  private normalizeHeaders(
    init?: HeadersInit
  ): Record<string, string> {
    if (!init) return {};
    if (init instanceof Headers) {
      return Object.fromEntries(init.entries());
    }
    if (Array.isArray(init)) {
      return Object.fromEntries(init as [string, string][]);
    }
    return { ...init };
  }

  private async fetchWithTimeout<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const token = this.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this.normalizeHeaders(options.headers),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        ...options,
        signal: controller.signal,
      });

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized - please log in");
      }

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

async login(email: string, password: string): Promise<LoginResponse> {
    const body = new URLSearchParams({ username: email, password });
    
    const response = await this.fetchWithTimeout<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: body.toString(),
    });

    // Automatically store the token on successful login
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async register(email: string, password: string): Promise<{ id: string; email: string }> {
    return this.fetchWithTimeout<{ id: string; email: string }>("/api/v1/auth/register", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  getIsAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  async getHealth(): Promise<HealthCheck> {
    return this.fetchWithTimeout<HealthCheck>("/health");
  }

  async pingMetrics(): Promise<PingMetrics> {
    return this.fetchWithTimeout<PingMetrics>("/api/v1/metrics/ping");
  }

  async startAnalysis(productUrl: string): Promise<{ job_id: string }> {
    return this.fetchWithTimeout<{ job_id: string }>("/api/v1/analysis/analyze", {
      method: "POST",
      body: JSON.stringify({ product_url: productUrl }),
    });
  }

  async getAnalysisStatus(jobId: string): Promise<AnalysisStatus> {
    return this.fetchWithTimeout<AnalysisStatus>(`/api/v1/analysis/status/${jobId}`);
  }

  async resumeAnalysis(jobId: string): Promise<{ job_id: string }> {
    return this.fetchWithTimeout<{ job_id: string }>(`/api/v1/analysis/jobs/${jobId}/resume`, {
      method: "POST",
    });
  }

  async getAnalysisResult(jobId: string): Promise<AnalysisResult> {
    return this.fetchWithTimeout<AnalysisResult>(`/api/v1/analysis/jobs/${jobId}/result`);
  }

  async getTelemetry(jobId: string): Promise<TelemetryData> {
    return this.fetchWithTimeout<TelemetryData>(`/api/v1/metrics/jobs/${jobId}/telemetry`);
  }

  async approveAnalysis(jobId: string): Promise<{ status: string }> {
    return this.fetchWithTimeout<{ status: string }>(`/api/v1/metrics/${jobId}/approve`, {
      method: "POST",
    });
  }
}

export const api = new APIClient();
