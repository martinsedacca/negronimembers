import { createClient } from '@/lib/supabase/server'
import BranchesList from '@/components/branches/BranchesList'
import { Plus } from 'lucide-react'

export default async function BranchesPage() {
  const supabase = await createClient()

  const { data: branches, error } = await supabase
    .from('branch_stats')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching branches:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sucursales</h1>
          <p className="mt-2 text-neutral-400">
            Gestiona las sucursales y ve sus estadísticas
          </p>
        </div>
      </div>

      <BranchesList branches={branches || []} />
    </div>
  )
}
