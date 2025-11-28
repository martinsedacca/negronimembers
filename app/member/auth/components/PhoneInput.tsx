'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PhoneInputProps {
  value: { countryCode: string; number: string }
  onChange: (value: { countryCode: string; number: string }) => void
  className?: string
  error?: string
  disabled?: boolean
}

interface Country {
  code: string
  name: string
  flag: string
  maxLength: number
  placeholder: string
}

const COUNTRIES: Country[] = [
  { 
    code: '+1', 
    name: 'US/Canada', 
    flag: '🇺🇸', 
    maxLength: 10,
    placeholder: '(305) 123-4567'
  },
  { 
    code: '+52', 
    name: 'Mexico', 
    flag: '🇲🇽', 
    maxLength: 10,
    placeholder: '55 1234 5678'
  },
  { 
    code: '+54', 
    name: 'Argentina', 
    flag: '🇦🇷', 
    maxLength: 10,
    placeholder: '11 1234 5678'
  },
  { 
    code: '+34', 
    name: 'Spain', 
    flag: '🇪🇸', 
    maxLength: 9,
    placeholder: '612 345 678'
  },
]

export default function PhoneInput({ 
  value, 
  onChange, 
  className = '', 
  error,
  disabled = false
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formattedNumber, setFormattedNumber] = useState('')

  const selectedCountry = COUNTRIES.find(c => c.code === value.countryCode) || COUNTRIES[0]

  // Format phone number based on country
  const formatPhoneNumber = (number: string, country: Country): string => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '')
    
    if (country.code === '+1') {
      // US/Canada format: (305) 123-4567
      if (cleaned.length <= 3) return cleaned
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (country.code === '+52' || country.code === '+54') {
      // Mexico/Argentina format: 55 1234 5678
      if (cleaned.length <= 2) return cleaned
      if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 10)}`
    } else {
      // Default format: 612 345 678
      if (cleaned.length <= 3) return cleaned
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
  }

  // Update formatted number when raw number changes
  useEffect(() => {
    setFormattedNumber(formatPhoneNumber(value.number, selectedCountry))
  }, [value.number, selectedCountry])

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Extract only digits
    const cleaned = input.replace(/\D/g, '')
    
    // Limit to country's max length
    const limited = cleaned.slice(0, selectedCountry.maxLength)
    
    // Update value with clean digits
    onChange({ ...value, number: limited })
  }

  const handleCountrySelect = (country: Country) => {
    onChange({ countryCode: country.code, number: value.number })
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="h-full px-3 py-4 bg-neutral-800 text-white border border-neutral-700 rounded-xl hover:bg-neutral-750 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition flex items-center gap-2 min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.code}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition flex items-center gap-3 group"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-orange-500 transition">
                      {country.name}
                    </div>
                    <div className="text-xs text-neutral-400">{country.code}</div>
                  </div>
                  {value.countryCode === country.code && (
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={formattedNumber}
          onChange={handleNumberChange}
          placeholder={selectedCountry.placeholder}
          disabled={disabled}
          className={`flex-1 px-4 py-4 bg-neutral-800 text-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-neutral-700'
          }`}
          maxLength={selectedCountry.maxLength + 5} // Add space for formatting characters
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className="mt-2 text-xs text-neutral-500">
          Enter your {selectedCountry.name} phone number ({selectedCountry.maxLength} digits)
        </p>
      )}
    </div>
  )
}
