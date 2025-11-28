'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PartyPopper, Download, Filter, Calendar, MapPin, Users, Mail, Phone, User, Search, X, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

interface EventRequest {
  id: string
  full_name: string
  phone: string
  email: string
  guests: string
  event_date: string
  event_type: string
  location_id: string
  created_at: string
  branches?: {
    name: string
    city: string | null
  }
}

interface Branch {
  id: string
  name: string
  city: string | null
}

export default function EventRequestsPage() {
  const [requests, setRequests] = useState<EventRequest[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    const [requestsRes, branchesRes] = await Promise.all([
      supabase
        .from('event_requests')
        .select(`
          *,
          branches (name, city)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('branches')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name')
    ])

    if (requestsRes.data) setRequests(requestsRes.data)
    if (branchesRes.data) setBranches(branchesRes.data)
    setLoading(false)
  }

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch = 
          req.full_name?.toLowerCase().includes(search) ||
          req.email?.toLowerCase().includes(search) ||
          req.phone?.includes(search) ||
          req.event_type?.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      // Branch filter
      if (selectedBranch && req.location_id !== selectedBranch) {
        return false
      }

      // Date range filter (on event_date)
      if (dateFrom && req.event_date < dateFrom) {
        return false
      }
      if (dateTo && req.event_date > dateTo) {
        return false
      }

      return true
    })
  }, [requests, searchTerm, selectedBranch, dateFrom, dateTo])

  // Export to Excel
  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Guests', 'Event Date', 'Event Type', 'Location', 'Submitted']
    
    const rows = filteredRequests.map(req => [
      req.full_name || '',
      req.email || '',
      req.phone || '',
      req.guests || '',
      req.event_date ? format(new Date(req.event_date), 'yyyy-MM-dd') : '',
      req.event_type || '',
      req.branches?.name || '',
      req.created_at ? format(new Date(req.created_at), 'yyyy-MM-dd HH:mm') : ''
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `event-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBranch('')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = searchTerm || selectedBranch || dateFrom || dateTo

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <PartyPopper className="w-8 h-8 text-orange-500" />
            Event Requests
          </h1>
          <p className="mt-2 text-neutral-400">
            Manage event planning requests from members
          </p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filteredRequests.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              hasActiveFilters 
                ? 'bg-orange-500/20 border-orange-500 text-orange-500' 
                : 'bg-neutral-900 border-neutral-700 text-white hover:border-neutral-600'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[searchTerm, selectedBranch, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-700">
            {/* Branch Filter */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Location</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">All locations</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.city && `(${branch.city})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Event Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Event Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="sm:col-span-3">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-neutral-400">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>

      {/* Requests Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900 border-b border-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Event Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-neutral-700/50 transition">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <User className="w-4 h-4 text-neutral-500" />
                        {req.full_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Mail className="w-4 h-4 text-neutral-500" />
                        <a href={`mailto:${req.email}`} className="hover:text-orange-500">
                          {req.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        <a href={`tel:${req.phone}`} className="hover:text-orange-500">
                          {req.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-white">
                        <PartyPopper className="w-4 h-4 text-orange-500" />
                        {req.event_type}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        {req.event_date ? format(new Date(req.event_date), 'PPP') : '-'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Users className="w-4 h-4 text-neutral-500" />
                        {req.guests} guests
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      {req.branches?.name || '-'}
                    </div>
                    {req.branches?.city && (
                      <div className="text-sm text-neutral-500 ml-6">
                        {req.branches.city}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-400">
                    {req.created_at ? format(new Date(req.created_at), 'PP') : '-'}
                    <br />
                    <span className="text-xs text-neutral-500">
                      {req.created_at ? format(new Date(req.created_at), 'p') : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <PartyPopper className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No requests found</h3>
            <p className="text-neutral-400">
              {hasActiveFilters 
                ? 'Try adjusting your filters' 
                : 'Event requests from members will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
