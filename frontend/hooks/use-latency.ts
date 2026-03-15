import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLatency() {
  return useQuery({
    queryKey: ['latency'],
    queryFn: async () => {
      const start = Date.now()
      const data = await api.pingMetrics()
      const latency_ms = Date.now() - start
      return { ...data, latency_ms }
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  })
}
