'use client'

import { useState, useEffect } from 'react'
import { Delete, Loader2 } from 'lucide-react'

interface PinPadProps {
  onSubmit: (pin: string) => void
  loading?: boolean
  error?: string | null
  pinLength?: number
}

export default function PinPad({ onSubmit, loading = false, error = null, pinLength = 6 }: PinPadProps) {
  const [pin, setPin] = useState('')

  // Auto-submit when PIN length reached
  useEffect(() => {
    if (pin.length === pinLength) {
      onSubmit(pin)
    }
  }, [pin, onSubmit, pinLength])

  // Clear pin on error
  useEffect(() => {
    if (error) {
      setPin('')
    }
  }, [error])

  const handleNumberClick = (num: string) => {
    if (pin.length < pinLength && !loading) {
      setPin(prev => prev + num)
    }
  }

  const handleDelete = () => {
    if (!loading) {
      setPin(prev => prev.slice(0, -1))
    }
  }

  const handleClear = () => {
    if (!loading) {
      setPin('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* PIN Display */}
      <div className="flex gap-3">
        {Array.from({ length: pinLength }).map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              pin.length > index
                ? 'bg-orange-500 scale-110'
                : 'bg-neutral-700'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-sm font-medium animate-shake">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-orange-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verificando...</span>
        </div>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={loading}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 hover:bg-neutral-700 
                       active:bg-orange-600 active:scale-95
                       rounded-2xl text-3xl font-bold text-white
                       transition-all duration-150 disabled:opacity-50
                       border border-neutral-700 hover:border-neutral-600"
          >
            {num}
          </button>
        ))}
        
        {/* Clear */}
        <button
          onClick={handleClear}
          disabled={loading}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 hover:bg-neutral-700 
                     rounded-2xl text-sm font-medium text-neutral-400
                     transition-all duration-150 disabled:opacity-50
                     border border-neutral-700 hover:border-neutral-600"
        >
          Clear
        </button>
        
        {/* Zero */}
        <button
          onClick={() => handleNumberClick('0')}
          disabled={loading}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 hover:bg-neutral-700 
                     active:bg-orange-600 active:scale-95
                     rounded-2xl text-3xl font-bold text-white
                     transition-all duration-150 disabled:opacity-50
                     border border-neutral-700 hover:border-neutral-600"
        >
          0
        </button>
        
        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 hover:bg-neutral-700 
                     rounded-2xl text-white
                     transition-all duration-150 disabled:opacity-50
                     border border-neutral-700 hover:border-neutral-600
                     flex items-center justify-center"
        >
          <Delete className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
}
