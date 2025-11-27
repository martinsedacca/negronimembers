'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  required?: boolean
  type?: 'date' | 'datetime'
}

export default function DatePicker({ 
  value, 
  onChange, 
  label, 
  required = false,
  type = 'datetime'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setViewDate(date)
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateClick = (day: number) => {
    const hour = selectedDate?.getHours() || 12
    const minute = selectedDate?.getMinutes() || 0
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, hour, minute)
    setSelectedDate(newDate)
    
    if (type === 'date') {
      onChange(newDate.toISOString().split('T')[0])
      setIsOpen(false)
    } else {
      onChange(newDate.toISOString().slice(0, 16))
    }
  }

  const handleTimeChange = (hour: number, minute: number) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(hour, minute)
      setSelectedDate(newDate)
      onChange(newDate.toISOString().slice(0, 16))
    }
  }

  const renderCalendar = () => {
    const days = []
    const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} />)
    }

    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate?.getDate() === day && 
        selectedDate?.getMonth() === viewDate.getMonth() &&
        selectedDate?.getFullYear() === viewDate.getFullYear()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`h-8 flex items-center justify-center text-xs rounded transition ${
            isSelected ? 'bg-orange-500 text-white font-bold' : 'text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          {day}
        </button>
      )
    }

    return <div className="grid grid-cols-7 gap-1">{days}</div>
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-700 text-white border border-neutral-600 rounded-lg hover:border-neutral-500 focus:ring-2 focus:ring-orange-500 transition"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-neutral-400" />
          <span className={value ? 'text-white' : 'text-neutral-400'}>
            {value ? new Date(value).toLocaleString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric',
              ...(type === 'datetime' && { hour: '2-digit', minute: '2-digit' })
            }) : 'Select date...'}
          </span>
        </div>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); setSelectedDate(null); }}
            className="p-1 hover:bg-neutral-600 rounded cursor-pointer inline-flex items-center justify-center"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(''); setSelectedDate(null); } }}
          >
            <X className="w-4 h-4" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg shadow-2xl p-3 w-72">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-neutral-700 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium text-white">
              {viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-neutral-700 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={`day-${i}`} className="h-6 flex items-center justify-center text-xs text-neutral-500 font-medium">{d}</div>
            ))}
          </div>

          {renderCalendar()}

          {type === 'datetime' && selectedDate && (
            <div className="mt-3 pt-3 border-t border-neutral-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <select
                value={selectedDate.getHours()}
                onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedDate.getMinutes())}
                className="flex-1 px-2 py-1 bg-neutral-700 text-white border border-neutral-600 rounded text-sm"
              >
                {Array.from({length: 24}, (_, i) => <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>)}
              </select>
              <span className="text-neutral-400">:</span>
              <select
                value={selectedDate.getMinutes()}
                onChange={(e) => handleTimeChange(selectedDate.getHours(), parseInt(e.target.value))}
                className="flex-1 px-2 py-1 bg-neutral-700 text-white border border-neutral-600 rounded text-sm"
              >
                {Array.from({length: 60}, (_, i) => <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>)}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 px-3 py-2 bg-orange-500 text-white rounded text-sm font-medium hover:bg-orange-600"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
