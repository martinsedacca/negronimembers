// =====================================================================
// API ROUTE: /api/admin/users/[id]/branches
// =====================================================================
// POST - Asignar sucursales a un usuario (manager o base)
// =====================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/permissions'
import { ROLES } from '@/lib/auth/roles'

// =====================================================================
// POST /api/admin/users/[id]/branches
// =====================================================================

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Verificar que es admin
  const authResult = await verifyAdmin()
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const supabase = await createClient()
  const userId = params.id

  try {
    const body = await request.json()
    const { branch_ids, role } = body

    // Validaciones
    if (!branch_ids || !Array.isArray(branch_ids) || branch_ids.length === 0) {
      return NextResponse.json(
        { error: 'branch_ids must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!role || ![ROLES.MANAGER, ROLES.BASE].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either manager or base' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe y no es system user
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_uuid: userId })

    if (!userRole) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userRole === ROLES.SUPERADMIN || userRole === ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot assign branches to system users' },
        { status: 400 }
      )
    }

    // Eliminar asignaciones existentes
    const { error: deleteError } = await supabase
      .from('branch_users')
      .delete()
      .eq('user_id', userId)

    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows
      throw deleteError
    }

    // Crear nuevas asignaciones
    const branchUserInserts = branch_ids.map((branchId: string) => ({
      user_id: userId,
      branch_id: branchId,
      role,
      is_active: true,
    }))

    const { error: insertError } = await supabase
      .from('branch_users')
      .insert(branchUserInserts)

    if (insertError) {
      throw new Error(`Failed to assign branches: ${insertError.message}`)
    }

    return NextResponse.json({
      message: 'Branches assigned successfully',
    })

  } catch (error: any) {
    console.error('Error assigning branches:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to assign branches' },
      { status: 500 }
    )
  }
}

// =====================================================================
// GET /api/admin/users/[id]/branches
// =====================================================================

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Verificar que es admin
  const authResult = await verifyAdmin()
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const supabase = await createClient()
  const userId = params.id

  try {
    // Obtener sucursales asignadas
    const { data: branches, error } = await supabase
      .from('branch_users')
      .select(`
        branch_id,
        role,
        branches (
          id,
          name,
          address
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error

    return NextResponse.json({
      branches: branches || [],
    })

  } catch (error: any) {
    console.error('Error fetching user branches:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user branches' },
      { status: 500 }
    )
  }
}
