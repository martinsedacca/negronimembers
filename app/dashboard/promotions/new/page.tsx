import { createClient } from '@/lib/supabase/server'
import NewPromotionForm from '@/components/promotions/NewPromotionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewPromotionPage() {
  const supabase = await createClient()

  const { data: membershipTypes } = await supabase
    .from('membership_types')
    .select('*')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/promotions"
          className="inline-flex items-center text-sm text-neutral-400 hover:text-brand-400 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Benefits
        </Link>
        <h1 className="text-3xl font-bold text-white">New Benefit</h1>
        <p className="mt-2 text-neutral-400">
          Create a new benefit for your members
        </p>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 shadow rounded-lg p-6">
        <NewPromotionForm membershipTypes={membershipTypes || []} />
      </div>
    </div>
  )
}
