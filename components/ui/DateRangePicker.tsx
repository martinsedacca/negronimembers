'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const [tempStart, setTempStart] = useState<string>(startDate)
  const [tempEnd, setTempEnd] = useState<string>(endDate)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempStart(startDate)
    setTempEnd(endDate)
  }, [startDate, endDate])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const dateStr = clickedDate.toISOString().split('T')[0]
    
    if (selecting === 'start') {
      setTempStart(dateStr)
      setTempEnd('')
      setSelecting('end')
    } else {
      // If end date is before start date, swap them
      if (new Date(dateStr) < new Date(tempStart)) {
        setTempEnd(tempStart)
        setTempStart(dateStr)
      } else {
        setTempEnd(dateStr)
      }
      setSelecting('start')
    }
  }

  const applyRange = () => {
    if (tempStart && tempEnd) {
      onChange(tempStart, tempEnd)
      setIsOpen(false)
    }
  }

  const isInRange = (day: number) => {
    if (!tempStart || !tempEnd) return false
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const start = new Date(tempStart)
    const end = new Date(tempEnd)
    return date >= start && date <= end
  }

  const isRangeStart = (day: number) => {
    if (!tempStart) return false
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return date.toISOString().split('T')[0] === tempStart
  }

  const isRangeEnd = (day: number) => {
    if (!tempEnd) return false
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return date.toISOString().split('T')[0] === tempEnd
  }

  const renderCalendar = () => {
    const days = []
    const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e-${i}`} />)
    }

    for (let day = 1; day <= totalDays; day++) {
      const inRange = isInRange(day)
      const isStart = isRangeStart(day)
      const isEnd = isRangeEnd(day)

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          className={`h-8 flex items-center justify-center text-xs rounded transition ${
            isStart || isEnd
              ? 'bg-orange-500 text-white font-bold'
              : inRange
              ? 'bg-orange-500/30 text-white'
              : 'text-neutral-300 hover:bg-neutral-700'
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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-neutral-700 text-white border border-neutral-600 rounded-lg hover:border-neutral-500 focus:ring-2 focus:ring-orange-500 transition"
      >
        <Calendar className="w-4 h-4 text-neutral-400" />
        <span className={startDate && endDate ? 'text-white' : 'text-neutral-400'}>
          {startDate && endDate 
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : 'Select date range...'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-neutral-800 border border-neutral-600 rounded-lg shadow-2xl p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button 
              type="button" 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} 
              className="p-1 hover:bg-neutral-700 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium text-white">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              type="button" 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} 
              className="p-1 hover:bg-neutral-700 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Selection indicator */}
          <div className="flex gap-2 mb-3 text-xs">
            <div className={`flex-1 p-2 rounded ${selecting === 'start' ? 'bg-orange-500/20 border border-orange-500' : 'bg-neutral-700'}`}>
              <div className="text-neutral-400">Start</div>
              <div className="text-white font-medium">{tempStart ? formatDate(tempStart) : '—'}</div>
            </div>
            <div className={`flex-1 p-2 rounded ${selecting === 'end' ? 'bg-orange-500/20 border border-orange-500' : 'bg-neutral-700'}`}>
              <div className="text-neutral-400">End</div>
              <div className="text-white font-medium">{tempEnd ? formatDate(tempEnd) : '—'}</div>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={`day-${i}`} className="h-6 flex items-center justify-center text-xs text-neutral-500 font-medium">{d}</div>
            ))}
          </div>

          {/* Calendar */}
          {renderCalendar()}

          {/* Actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-700">
            <button
              type="button"
              onClick={() => { setTempStart(startDate); setTempEnd(endDate); setIsOpen(false) }}
              className="flex-1 px-3 py-2 text-sm text-neutral-400 hover:text-white rounded transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyRange}
              disabled={!tempStart || !tempEnd}
              className="flex-1 px-3 py-2 bg-orange-500 text-white rounded text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
