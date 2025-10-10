import { createClient } from '@/lib/supabase/server'
import MembersList from '@/components/members/MembersList'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: membershipTypes } = await supabase
    .from('membership_types')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching members:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Miembros</h1>
          <p className="mt-2 text-neutral-400">
            Gestiona todos los miembros y sus membresías
          </p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Miembro
        </Link>
      </div>

      <MembersList 
        members={members || []} 
        membershipTypes={membershipTypes || []}
      />
    </div>
  )
}
