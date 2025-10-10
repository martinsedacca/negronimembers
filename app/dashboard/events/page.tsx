import { createClient } from '@/lib/supabase/server'
import EventsList from '@/components/events/EventsList'
import { Calendar } from 'lucide-react'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('event_stats')
    .select('*')
    .order('event_date', { ascending: false })

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            Eventos
          </h1>
          <p className="mt-2 text-neutral-400">
            Gestiona eventos e invitaciones a miembros
          </p>
        </div>
      </div>

      <EventsList 
        events={events || []} 
        branches={branches || []}
      />
    </div>
  )
}
