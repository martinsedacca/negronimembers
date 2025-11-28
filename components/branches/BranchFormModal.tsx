'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2, Search, MapPin } from 'lucide-react'
import type { Database } from '@/lib/types/database'

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any
  }
}

type Branch = Database['public']['Tables']['branches']['Row']

const GOOGLE_MAPS_API_KEY = 'AIzaSyBHC1vXgdOFGW4_ULtrWgft5ksBSaI28_E'

interface BranchFormModalProps {
  branch?: Branch
  onClose: () => void
  onSuccess: () => void
}

export default function BranchFormModal({ branch, onClose, onSuccess }: BranchFormModalProps) {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    address: branch?.address || '',
    city: branch?.city || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    manager_name: branch?.manager_name || '',
    menu_url: (branch as any)?.menu_url || '',
    booking_url: (branch as any)?.booking_url || '',
    latitude: branch?.latitude?.toString() || '',
    longitude: branch?.longitude?.toString() || '',
    is_active: branch?.is_active ?? true,
  })

  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = initServices
      document.head.appendChild(script)
    } else if (window.google) {
      initServices()
    }
  }, [])

  const initServices = () => {
    if (window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div')
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv)
    }
  }

  // Search using Google Places Autocomplete
  const searchAddress = async (query: string) => {
    if (query.length < 2 || !autocompleteService.current) {
      setSearchResults([])
      return
    }
    
    setSearching(true)
    try {
      autocompleteService.current.getPlacePredictions(
        { input: query, types: ['establishment', 'geocode'] },
        (predictions: any[], status: string) => {
          if (status === 'OK' && predictions) {
            setSearchResults(predictions)
          } else {
            setSearchResults([])
          }
          setSearching(false)
        }
      )
    } catch (error) {
      console.error('Search error:', error)
      setSearching(false)
    }
  }

  // Get place details when selecting a result
  const selectSearchResult = (prediction: any) => {
    if (!placesService.current) return
    
    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'formatted_address', 'address_components', 'name'] },
      (place: any, status: string) => {
        if (status === 'OK' && place) {
          // Extract city from address components
          let city = ''
          let state = ''
          if (place.address_components) {
            for (const component of place.address_components) {
              if (component.types.includes('locality')) {
                city = component.long_name
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name
              }
            }
          }
          
          setFormData(prev => ({
            ...prev,
            latitude: place.geometry.location.lat().toString(),
            longitude: place.geometry.location.lng().toString(),
            address: place.formatted_address || '',
            city: city ? `${city}${state ? ', ' + state : ''}` : prev.city
          }))
        }
        setSearchResults([])
        setSearchQuery('')
      }
    )
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchAddress(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = branch ? `/api/branches/${branch.id}` : '/api/branches'
      const method = branch ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      onSuccess()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {branch ? 'Edit Location' : 'New Location'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: Palermo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Av. Santa Fe 1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Buenos Aires"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="palermo@negroni.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Manager
            </label>
            <input
              type="text"
              value={formData.manager_name}
              onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Manager name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Menu URL
            </label>
            <input
              type="url"
              value={formData.menu_url}
              onChange={(e) => setFormData({ ...formData, menu_url: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://menu.example.com/location"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Link to the menu for this location
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Booking URL
            </label>
            <input
              type="url"
              value={formData.booking_url}
              onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://opentable.com/r/location"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Link to book a table (OpenTable, Resy, etc.)
            </p>
          </div>

          {/* Map Location Search */}
          <div className="border border-neutral-600 rounded-lg p-4 space-y-3">
            <label className="block text-sm font-medium text-neutral-300 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Map Location
            </label>
            
            {/* Address Search */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a place or address..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-700 text-white border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
                )}
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.place_id || index}
                      type="button"
                      onClick={() => selectSearchResult(result)}
                      className="w-full px-4 py-3 text-left hover:bg-neutral-700 border-b border-neutral-700 last:border-0 transition"
                    >
                      <p className="text-sm text-white truncate">
                        {result.structured_formatting?.main_text || result.description}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {result.structured_formatting?.secondary_text || ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinates Display */}
            {formData.latitude && formData.longitude ? (
              <div className="bg-neutral-700/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400">Coordinates captured ✓</p>
                    <p className="text-sm text-white font-mono">
                      {formData.latitude}, {formData.longitude}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                    >
                      View Map
                    </a>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, latitude: '', longitude: '', city: '' }))}
                      className="text-xs px-3 py-1.5 bg-neutral-600 text-white rounded hover:bg-neutral-500 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {!formData.address && (
                  <p className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                    💡 Copy the address from Google Maps into the Address field above
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Paste a Google Maps link above to capture coordinates
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-300">
              Active Location
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formData.is_active ? 'bg-green-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
