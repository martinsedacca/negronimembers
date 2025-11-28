import { createClient } from '@/lib/supabase/server'
import MembersList from '@/components/members/MembersList'
import { Plus } from 'lucide-react'
import Link from 'next/link'

// Revalidar cada 60 segundos
export const revalidate = 60

export default async function MembersPage() {
  const supabase = await createClient()

  // Get members with calculated stats from card_usage
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Get all card_usage to calculate stats
  const { data: allUsage } = await supabase
    .from('card_usage')
    .select('member_id, amount_spent, points_earned, created_at')

  // Calculate stats for each member
  const membersWithStats = (members || []).map(member => {
    const memberUsage = (allUsage || []).filter(u => u.member_id === member.id)
    const lifetimeSpent = memberUsage.reduce((sum, u) => sum + (parseFloat(String(u.amount_spent)) || 0), 0)
    const totalVisits = memberUsage.length
    const totalPoints = memberUsage.reduce((sum, u) => sum + (u.points_earned || 0), 0)
    
    return {
      ...member,
      lifetime_spent: lifetimeSpent,
      total_visits: totalVisits,
      points: totalPoints, // Override with calculated
    }
  })

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
          <h1 className="text-3xl font-bold text-white">Members</h1>
          <p className="mt-2 text-neutral-400">
            Manage all members and their memberships
          </p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Member
        </Link>
      </div>

      <MembersList 
        members={membersWithStats} 
        membershipTypes={membershipTypes || []}
      />
    </div>
  )
}
