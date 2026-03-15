'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 py-12">
      {/* Floating icon background */}
      <motion.div
        className="relative w-32 h-32 mb-8"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
            }}
          />
        ))}

        {/* Icon container */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
          {icon ? (
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              {icon}
            </motion.div>
          ) : (
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <Zap className="w-12 h-12 text-primary" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Action */}
      {action && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  )
}
