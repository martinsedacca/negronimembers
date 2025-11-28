'use client'

import React from 'react'

interface BookingButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

export function BookingButton({ children, className = '', ...props }: BookingButtonProps) {
  return (
    <a
      className={`
        group relative inline-flex w-full items-center justify-center 
        rounded-xl px-8 py-4 font-semibold text-[#F0DBC0]
        bg-[#B21F20] border-2 border-[#F0DBC0]
        overflow-hidden cursor-pointer
        transition-all duration-300
        hover:shadow-[0_0_20px_rgba(178,31,32,0.5)]
        hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
      {...props}
    >
      {/* Shimmer effect */}
      <span 
        className="absolute inset-0 animate-booking-shimmer bg-gradient-to-r from-transparent via-[#F0DBC0]/20 to-transparent"
        style={{ backgroundSize: '200% 100%' }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </a>
  )
}
