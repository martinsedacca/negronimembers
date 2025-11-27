import { createClient } from '@/lib/supabase/server'
import { Plus, Tag, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import CodesList from '@/components/codes/CodesList'

export const dynamic = 'force-dynamic'

export default async function CodesPage() {
  const supabase = await createClient()

  // Fetch codes with member usage stats
  const { data: codes } = await supabase
    .from('codes')
    .select(`
      *,
      member_codes(count)
    `)
    .order('created_at', { ascending: false })

  // Get stats
  const totalCodes = codes?.length || 0
  const activeCodes = codes?.filter((c: any) => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length || 0
  const totalUses = codes?.reduce((sum: number, c: any) => sum + (c.member_codes?.length || 0), 0) || 0

  const stats = [
    {
      name: 'Total Codes',
      value: totalCodes,
      icon: Tag,
      color: 'bg-orange-500',
    },
    {
      name: 'Active Codes',
      value: activeCodes,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      name: 'Total Uses',
      value: totalUses,
      icon: Users,
      color: 'bg-blue-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-orange-500" />
            Member Codes
          </h1>
          <p className="mt-2 text-neutral-400">
            Create codes to enable special benefits for specific member groups
          </p>
        </div>
        <Link
          href="/dashboard/codes/new"
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Code
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-3xl font-semibold text-white">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Codes List */}
      <CodesList codes={codes || []} />
    </div>
  )
}
