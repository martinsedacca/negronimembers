import { createClient } from '@/lib/supabase/server'
import MembershipTypesList from '@/components/membership-types/MembershipTypesList'
import { Users } from 'lucide-react'
import Link from 'next/link'

export default async function MembershipTypesPage() {
  const supabase = await createClient()

  const { data: membershipTypes } = await supabase
    .from('membership_types')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            Membership Types
          </h1>
          <p className="mt-2 text-neutral-400">
            Manage membership tiers and their configurations
          </p>
        </div>
        <Link
          href="/dashboard/membership-types/new"
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          + New Membership Type
        </Link>
      </div>

      <MembershipTypesList membershipTypes={membershipTypes || []} />
    </div>
  )
}
