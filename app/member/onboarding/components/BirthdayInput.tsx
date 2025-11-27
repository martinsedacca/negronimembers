'use client'

import { motion } from 'framer-motion'

interface BirthdayInputProps {
  value: { day: string; month: string; year: string }
  onChange: (value: { day: string; month: string; year: string }) => void
  className?: string
  error?: string
  disabled?: boolean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function BirthdayInput({ 
  value, 
  onChange, 
  className = '', 
  error,
  disabled = false
}: BirthdayInputProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i - 13) // Start from 13 years ago (min age)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Validate day based on month and year
  const getDaysInMonth = (month: string, year: string): number => {
    if (!month || !year) return 31
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    return new Date(yearNum, monthNum, 0).getDate()
  }

  const maxDays = getDaysInMonth(value.month, value.year)

  // Auto-adjust day if it's invalid for the selected month
  const handleMonthChange = (newMonth: string) => {
    const newValue = { ...value, month: newMonth }
    const maxDaysInMonth = getDaysInMonth(newMonth, value.year)
    
    if (value.day && parseInt(value.day) > maxDaysInMonth) {
      newValue.day = maxDaysInMonth.toString()
    }
    
    onChange(newValue)
  }

  const handleYearChange = (newYear: string) => {
    const newValue = { ...value, year: newYear }
    const maxDaysInMonth = getDaysInMonth(value.month, newYear)
    
    if (value.day && parseInt(value.day) > maxDaysInMonth) {
      newValue.day = maxDaysInMonth.toString()
    }
    
    onChange(newValue)
  }

  // Calculate age for display
  const getAge = (): number | null => {
    if (!value.day || !value.month || !value.year) return null
    const birthDate = new Date(parseInt(value.year), parseInt(value.month) - 1, parseInt(value.day))
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = getAge()

  const selectClassName = `w-full px-4 py-4 bg-neutral-800 text-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
    error ? 'border-red-500' : 'border-neutral-700'
  }`

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-3">
        {/* Month Selector */}
        <div className="relative">
          <select
            value={value.month}
            onChange={(e) => handleMonthChange(e.target.value)}
            disabled={disabled}
            className={selectClassName}
          >
            <option value="" disabled>Month</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Day Selector */}
        <div className="relative">
          <select
            value={value.day}
            onChange={(e) => onChange({ ...value, day: e.target.value })}
            disabled={disabled}
            className={selectClassName}
          >
            <option value="" disabled>Day</option>
            {days.slice(0, maxDays).map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Year Selector */}
        <div className="relative">
          <select
            value={value.year}
            onChange={(e) => handleYearChange(e.target.value)}
            disabled={disabled}
            className={selectClassName}
          >
            <option value="" disabled>Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Age Display */}
      {age !== null && !error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-sm text-neutral-400"
        >
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>Age: {age} years old</span>
          {age < 18 && (
            <span className="text-orange-500 font-medium">(Parental consent may be required)</span>
          )}
        </motion.div>
      )}

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
      {!error && !age && (
        <p className="mt-2 text-xs text-neutral-500">
          Select your date of birth to continue
        </p>
      )}
    </div>
  )
}
