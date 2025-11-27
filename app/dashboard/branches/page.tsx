import { createClient } from '@/lib/supabase/server'
import BranchesList from '@/components/branches/BranchesList'
import { Plus } from 'lucide-react'

// Revalidar cada 60 segundos
export const revalidate = 60

export default async function BranchesPage() {
  const supabase = await createClient()

  const { data: branches, error } = await supabase
    .from('branches')
    .select('*')
    .order('name')
    .limit(50) // Limitar resultados

  if (error) {
    console.error('Error fetching branches:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Locations</h1>
          <p className="mt-2 text-neutral-400">
            Manage locations and view their statistics
          </p>
        </div>
      </div>

      <BranchesList branches={branches || []} />
    </div>
  )
}
