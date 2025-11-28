'use client'

import { ReactNode } from 'react'
import '../globals.css'

export default function ScannerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900">
      {children}
    </div>
  )
}
