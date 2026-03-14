import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLatency() {
  return useQuery({
    queryKey: ['latency'],
    queryFn: () => api.pingMetrics(),
    refetchInterval: 10000, // Poll every 10s
    refetchIntervalInBackground: true,
  })
}
