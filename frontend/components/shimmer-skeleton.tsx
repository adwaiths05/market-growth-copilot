'use client'

import { motion } from 'framer-motion'

interface ShimmerSkeletonProps {
  width?: string
  height?: string
  className?: string
  count?: number
  circle?: boolean
}

export function ShimmerSkeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  count = 1,
  circle = false,
}: ShimmerSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${height} ${circle ? 'rounded-full' : 'rounded-lg'} bg-muted relative overflow-hidden`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/30 p-6 space-y-4">
      <ShimmerSkeleton width="w-1/3" height="h-6" />
      <ShimmerSkeleton width="w-full" height="h-4" count={3} />
      <ShimmerSkeleton width="w-2/3" height="h-4" />
    </div>
  )
}

export function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
