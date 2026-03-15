'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface LandingFeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  delay?: number
}

export function LandingFeatureCard({ title, description, icon: Icon, delay = 0 }: LandingFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/15 p-6 space-y-4"
    >
      {/* Contextual icon — scales and glows on hover */}
      <div className="relative flex items-center justify-center h-12">
        <motion.div
          animate={{
            scale: isHovered ? 1.15 : 1,
            opacity: isHovered ? 1 : 0.7,
          }}
          transition={{ duration: 0.2 }}
          className="rounded-xl bg-primary/10 p-3 text-primary"
        >
          <Icon className="w-6 h-6" strokeWidth={1.8} />
        </motion.div>
      </div>
      <div>
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
      </div>
    </motion.div>
  )
}
