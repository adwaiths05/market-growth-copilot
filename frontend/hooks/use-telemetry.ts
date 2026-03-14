import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useTelemetry(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['telemetry', jobId],
    queryFn: () => api.getTelemetry(jobId),
    refetchInterval: 5000, // Poll every 5s
    refetchIntervalInBackground: true,
    enabled,
    retry: 2,
  })
}
