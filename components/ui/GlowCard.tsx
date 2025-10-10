'use client'

import { useRef, useState, MouseEvent } from 'react'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  glowSize?: number
}

export default function GlowCard({ 
  children, 
  className = '', 
  glowColor = '#F0DBC0',
  glowSize = 300
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: -1000, y: -1000 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl p-[2px] transition-all duration-300 ${className}`}
      style={{
        background: `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent)`,
      }}
    >
      <div className="rounded-[14px] w-full h-full bg-gradient-to-b from-neutral-800/50 to-neutral-950/50 backdrop-blur-sm">
        {children}
      </div>
    </div>
  )
}
