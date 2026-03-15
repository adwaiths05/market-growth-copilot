'use client'

import { motion } from 'framer-motion'
import { useCursorGlow } from '@/hooks/use-cursor-glow'

export function BackgroundEffects() {
  const { position, isMoving } = useCursorGlow()

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Base mesh orbs (subtle when no cursor) */}
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            </filter>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.12" />
            </linearGradient>
            <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="200"
            cy="150"
            r="200"
            fill="url(#grad1)"
            filter="url(#blur)"
            animate={{ cx: [200, 250, 200], cy: [150, 200, 150] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="1000"
            cy="600"
            r="250"
            fill="url(#grad2)"
            filter="url(#blur)"
            animate={{ cx: [1000, 950, 1000], cy: [600, 550, 600] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="600"
            cy="400"
            r="150"
            fill="url(#grad1)"
            filter="url(#blur)"
            animate={{ cx: [600, 650, 600], cy: [400, 350, 400] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Cursor-following purple mesh highlight — intensifies on hover */}
      <motion.div
        className="pointer-events-none fixed w-[420px] h-[420px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{
          left: position.x,
          top: position.y,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)',
        }}
        animate={{
          opacity: isMoving ? 0.85 : 0,
          scale: isMoving ? 1 : 0.8,
        }}
        transition={{
          opacity: { duration: 0.25 },
          scale: { duration: 0.2 },
        }}
      />

      {/* Secondary softer glow under cursor */}
      {isMoving && (
        <motion.div
          className="pointer-events-none fixed w-[280px] h-[280px] rounded-full blur-2xl opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent 65%)',
            left: position.x - 140,
            top: position.y - 140,
          }}
          transition={{ type: 'spring', damping: 35, mass: 0.2 }}
        />
      )}

      {/* Floating ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-xl opacity-[0.08] dark:opacity-[0.06]"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              left: `${i * 25}%`,
              top: `${i * 20}%`,
            }}
            animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}
