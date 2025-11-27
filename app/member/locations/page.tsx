'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRequireAuth } from '../context/MemberContext'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, Phone, Navigation, Search, Locate, X, ExternalLink, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamically import the map component to avoid SSR issues
const LocationsMap = dynamic(() => import('./LocationsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-72 bg-neutral-800 rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  )
})

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  distance?: number
}

// Calculate distance between two points in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function LocationsPage() {
  const { loading: authLoading } = useRequireAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch locations
  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from('branches')
        .select('id, name, address, city, phone, email, latitude, longitude')
        .eq('is_active', true)
        .order('name')
      
      if (data) setLocations(data)
      setLoading(false)
    }
    fetchLocations()
  }, [])

  // Request user location
  const requestLocation = () => {
    setLocationLoading(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationLoading(false)
      },
      (error) => {
        setLocationError('Unable to get your location')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Don't auto-request - mobile browsers block it without user interaction

  // Calculate distances and sort
  const locationsWithDistance = useMemo(() => {
    if (!userLocation) return locations
    
    return locations.map(loc => ({
      ...loc,
      distance: loc.latitude && loc.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude)
        : undefined
    })).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
  }, [locations, userLocation])

  // Filter by search
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locationsWithDistance
    const q = searchQuery.toLowerCase()
    return locationsWithDistance.filter(loc => 
      loc.name.toLowerCase().includes(q) ||
      loc.address?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q)
    )
  }, [locationsWithDistance, searchQuery])

  const locationsWithCoords = filteredLocations.filter(l => l.latitude && l.longitude)
  const nearestLocation = locationsWithDistance.find(l => l.distance !== undefined)

  // Handle location selection
  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location)
    setShowModal(true)
  }

  // Navigation URLs
  const getNavigationUrls = (loc: Location) => {
    if (!loc.latitude || !loc.longitude) return null
    const dest = `${loc.latitude},${loc.longitude}`
    const address = encodeURIComponent(`${loc.address || ''} ${loc.city || ''}`.trim())
    
    return {
      apple: `maps://maps.apple.com/?daddr=${dest}&dirflg=d`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      waze: `https://waze.com/ul?ll=${dest}&navigate=yes`,
      share: `https://www.google.com/maps/search/?api=1&query=${dest}`
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Find Us</h1>
        
        {/* Location Button */}
        {!userLocation && !locationLoading && (
          <button
            onClick={requestLocation}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
          >
            <Locate className="w-5 h-5" />
            Use My Location
          </button>
        )}
        
        {locationLoading && (
          <div className="mt-3 flex items-center justify-center gap-2 py-3 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Getting your location...
          </div>
        )}
        
        {userLocation && (
          <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
            <Locate className="w-4 h-4" />
            Location enabled - showing distances
          </div>
        )}

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Nearest Location Banner */}
        {nearestLocation && nearestLocation.distance !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl"
          >
            <p className="text-xs text-orange-300 mb-1">📍 Nearest location</p>
            <p className="text-white font-semibold">{nearestLocation.name}</p>
            <p className="text-sm text-orange-200">{nearestLocation.distance.toFixed(1)} miles away</p>
          </motion.div>
        )}
      </div>

      {/* Map */}
      {locationsWithCoords.length > 0 && (
        <div className="px-4 mb-4">
          <LocationsMap 
            locations={locationsWithCoords}
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
          />
        </div>
      )}

      {/* Locations List */}
      <div className="px-4 space-y-3">
        <p className="text-sm text-neutral-500">
          {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        
        {filteredLocations.map((location) => (
          <motion.div
            key={location.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => handleSelectLocation(location)}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              selectedLocation?.id === location.id
                ? 'bg-orange-500/10 border-orange-500/50'
                : 'bg-neutral-800 border-neutral-700 active:scale-[0.98]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{location.name}</h3>
                  {location.distance !== undefined && (
                    <span className="text-xs px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded-full">
                      {location.distance.toFixed(1)} mi
                    </span>
                  )}
                </div>
                {location.address && (
                  <p className="text-sm text-neutral-400 mt-1">
                    {location.address}
                    {location.city && `, ${location.city}`}
                  </p>
                )}
              </div>
              
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                <Navigation className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">No locations found</p>
          </div>
        )}
      </div>

      {/* Location Detail Modal */}
      <AnimatePresence>
        {showModal && selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-neutral-900 rounded-t-3xl p-6 pb-10"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />
              
              {/* Location Info */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">{selectedLocation.name}</h2>
                {selectedLocation.address && (
                  <p className="text-neutral-400 mt-1">
                    {selectedLocation.address}
                    {selectedLocation.city && `, ${selectedLocation.city}`}
                  </p>
                )}
                {selectedLocation.distance !== undefined && (
                  <p className="text-orange-400 text-sm mt-2">
                    {selectedLocation.distance.toFixed(1)} miles away
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              {selectedLocation.phone && (
                <a
                  href={`tel:${selectedLocation.phone}`}
                  className="flex items-center gap-3 p-4 bg-neutral-800 rounded-xl mb-3 hover:bg-neutral-700 transition"
                >
                  <Phone className="w-5 h-5 text-orange-400" />
                  <span className="text-white">{selectedLocation.phone}</span>
                </a>
              )}

              {/* Navigation Options */}
              {selectedLocation.latitude && selectedLocation.longitude && (
                <>
                  <p className="text-sm text-neutral-500 mb-3 mt-4">Get Directions</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(() => {
                      const urls = getNavigationUrls(selectedLocation)
                      if (!urls) return null
                      return (
                        <>
                          <a
                            href={urls.apple}
                            className="flex flex-col items-center gap-2 p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs text-neutral-300">Maps</span>
                          </a>
                          <a
                            href={urls.google}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                              <Navigation className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs text-neutral-300">Google</span>
                          </a>
                          <a
                            href={urls.waze}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition"
                          >
                            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs text-neutral-300">Waze</span>
                          </a>
                        </>
                      )
                    })()}
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      const urls = getNavigationUrls(selectedLocation)
                      if (urls && navigator.share) {
                        navigator.share({
                          title: selectedLocation.name,
                          text: `${selectedLocation.address || ''} ${selectedLocation.city || ''}`,
                          url: urls.share
                        })
                      } else if (urls) {
                        window.open(urls.share, '_blank')
                      }
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Location
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
