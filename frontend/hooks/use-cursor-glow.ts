'use client'

import { useState, useEffect } from 'react'

export interface CursorPosition {
  x: number
  y: number
}

export function useCursorGlow() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsMoving(true)
    }

    const handleMouseLeave = () => {
      setIsMoving(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return { position, isMoving }
}
