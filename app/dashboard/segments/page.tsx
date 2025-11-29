import { createClient } from '@/lib/supabase/server'
import SegmentBuilder from '@/components/segments/SegmentBuilder'
import { Filter } from 'lucide-react'

export default async function SegmentsPage() {
  const supabase = await createClient()

  // Get membership types for filters
  const { data: membershipTypes } = await supabase
    .from('membership_types')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Filter className="w-8 h-8 text-orange-500" />
            Member Segmentation
          </h1>
          <p className="mt-2 text-neutral-400">
            Filter members by behavior, spending and other criteria
          </p>
        </div>
      </div>

      <SegmentBuilder 
        membershipTypes={membershipTypes || []}
      />
    </div>
  )
}
