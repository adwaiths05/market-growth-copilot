import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { AnalysisStatus } from '@/lib/types'

export function useAnalysisStatus(jobId: string) {
  return useQuery({
    queryKey: ['analysis-status', jobId],
    queryFn: () => api.getAnalysisStatus(jobId),
    refetchInterval: 2000, // Poll every 2s
    refetchIntervalInBackground: true,
    retry: 3,
  })
}
