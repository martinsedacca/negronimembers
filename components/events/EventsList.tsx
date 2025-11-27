'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, Plus, UserPlus } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import { format } from 'date-fns'
import EventFormModal from './EventFormModal'
import InviteMembersModal from './InviteMembersModal'

type EventStats = Database['public']['Views']['event_stats']['Row']
type Branch = Database['public']['Tables']['branches']['Row']

interface EventsListProps {
  events: EventStats[]
  branches: Branch[]
}

export default function EventsList({ events, branches }: EventsListProps) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventStats | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-neutral-100 text-neutral-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming'
      case 'ongoing': return 'Ongoing'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* New Event Button */}
      <button
        onClick={() => setShowNewForm(true)}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        <Plus className="w-5 h-5 mr-2" />
        New Event
      </button>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
            {/* Event Image Placeholder */}
            <div className="h-40 bg-gradient-to-br from-orange-500/20 to-brand-500/20 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-orange-500/50" />
            </div>

            <div className="p-6 space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{event.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-neutral-400 line-clamp-2">{event.description}</p>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  {format(new Date(event.event_date), "PPP 'at' p")}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-neutral-300">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    {event.location}
                  </div>
                )}
              </div>

              {/* Attendance Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{event.total_invited}</div>
                  <div className="text-xs text-neutral-500">Invited</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{event.confirmed_count}</div>
                  <div className="text-xs text-neutral-500">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{event.attended_count}</div>
                  <div className="text-xs text-neutral-500">Attended</div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  setSelectedEvent(event)
                  setShowInviteModal(true)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition"
              >
                <UserPlus className="w-4 h-4" />
                Invite Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-lg">
          <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No events yet</h3>
          <p className="text-neutral-400 mb-4">Create your first event to get started</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Event
          </button>
        </div>
      )}

      {/* Modals */}
      {showNewForm && (
        <EventFormModal
          branches={branches}
          onClose={() => setShowNewForm(false)}
          onSuccess={() => {
            setShowNewForm(false)
            window.location.reload()
          }}
        />
      )}

      {showInviteModal && selectedEvent && (
        <InviteMembersModal
          event={selectedEvent}
          onClose={() => {
            setShowInviteModal(false)
            setSelectedEvent(null)
          }}
          onSuccess={() => {
            setShowInviteModal(false)
            setSelectedEvent(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
