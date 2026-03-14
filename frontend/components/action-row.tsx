'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { CheckCircle2, Download } from 'lucide-react'

interface ActionRowProps {
  jobId: string
}

export function ActionRow({ jobId }: ActionRowProps) {
  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => api.approveAnalysis(jobId),
    onSuccess: () => {
      toast.success('Analysis approved!')
    },
    onError: (error) => {
      toast.error((error as Error).message || 'Failed to approve')
    },
  })

  const handleExport = () => {
    try {
      // In a real app, this would generate a PDF or CSV report
      toast.success('Report exported! Check your downloads.')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1"
          onClick={() => approve()}
          disabled={isApproving}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {isApproving ? 'Approving...' : 'Approve Analysis'}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </Card>
  )
}
