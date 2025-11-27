// =====================================================================
// PAGE: /dashboard/users
// =====================================================================
// Gestión de usuarios del sistema
// Solo accesible para SuperAdmin y Admin
// =====================================================================

import { requireAdmin } from '@/lib/auth/permissions'
import UsersTable from './components/UsersTable'
import { Suspense } from 'react'

export const metadata = {
  title: 'Gestión de Usuarios | Negroni',
  description: 'Administración de usuarios del sistema',
}

export default async function UsersPage() {
  // Verificar que el usuario es admin
  const { user, role } = await requireAdmin()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            👥 User Management
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage system users and their permissions
          </p>
        </div>
      </div>

      {/* Users Table */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable currentUserRole={role} />
      </Suspense>
    </div>
  )
}

// Skeleton while loading
function UsersTableSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-neutral-700 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
