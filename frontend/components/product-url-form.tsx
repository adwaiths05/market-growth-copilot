'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export function ProductUrlForm() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const { mutate: startAnalysis, isPending } = useMutation({
    mutationFn: async (productUrl: string) => {
      // Validate URL
      try {
        const urlObj = new URL(productUrl)
        const hostname = urlObj.hostname.toLowerCase()
        
        // Only allow Amazon or Shopify
        if (!hostname.includes('amazon') && !hostname.includes('shopify')) {
          throw new Error('Only Amazon and Shopify URLs are supported')
        }
      } catch {
        throw new Error('Please enter a valid URL (Amazon or Shopify only)')
      }

      return api.startAnalysis(productUrl)
    },
    onSuccess: (data) => {
      // Save to localStorage
      const jobs = JSON.parse(localStorage.getItem('analysis_jobs') || '[]')
      jobs.unshift({
        job_id: data.job_id,
        product_url: url,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem('analysis_jobs', JSON.stringify(jobs))

      toast.success('Analysis started! Redirecting...')
      router.push(`/analysis/${data.job_id}`)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Failed to start analysis'
      setError(message)
      toast.error(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a product URL')
      return
    }

    startAnalysis(url)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <label htmlFor="url" className="block text-sm font-semibold">
          Product URL
        </label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enter an Amazon or Shopify product URL to analyze
        </p>
      </div>
      
      <div className="flex gap-2">
        <Input
          id="url"
          type="url"
          placeholder="https://www.amazon.com/dp/..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          disabled={isPending}
          className="flex-1 border-border bg-input"
        />
        <Button
          type="submit"
          disabled={isPending || !url.trim()}
          className="interactive-hover"
        >
          {isPending ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive font-medium">
            {error}
          </p>
        </div>
      )}
    </form>
  )
}
