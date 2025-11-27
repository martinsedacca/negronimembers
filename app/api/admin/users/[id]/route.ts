// =====================================================================
// API ROUTE: /api/admin/users/[id]
// =====================================================================
// GET - Obtener usuario específico
// PATCH - Actualizar usuario
// DELETE - Eliminar usuario
// =====================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/permissions'
import { ROLES, isAdmin, type UserRole } from '@/lib/auth/roles'

// =====================================================================
// GET /api/admin/users/[id]
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

  const { role } = authResult
  const supabase = await createClient()
  const userId = params.id

  try {
    // Obtener rol del usuario
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_uuid: userId })

    if (!userRole) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Si es admin (no superadmin), no puede ver superadmins
    if (role === ROLES.ADMIN && userRole === ROLES.SUPERADMIN) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Obtener datos según el rol
    let userData: any = {}

    if (userRole === ROLES.SUPERADMIN || userRole === ROLES.ADMIN) {
      // Buscar en system_users
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      userData = data
    } else if (userRole === ROLES.MANAGER || userRole === ROLES.BASE) {
      // Buscar en branch_users
      const { data, error } = await supabase
        .from('branch_users')
        .select(`
          *,
          branches (
            id,
            name
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      // Obtener info de auth
      const { data: authData } = await supabase.auth.admin.getUserById(userId)

      userData = {
        user_id: userId,
        email: authData.user?.email,
        full_name: authData.user?.user_metadata?.full_name,
        role: userRole,
        branches: data || [],
        is_active: data?.[0]?.is_active ?? true,
        created_at: data?.[0]?.created_at,
        updated_at: data?.[0]?.updated_at,
      }
    }

    return NextResponse.json({ user: userData })

  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// =====================================================================
// PATCH /api/admin/users/[id]
// =====================================================================

export async function PATCH(
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

  const { role: currentRole } = authResult
  const supabase = await createClient()
  const userId = params.id

  try {
    const body = await request.json()
    const { full_name, email, is_active, password } = body

    // Obtener rol del usuario a editar
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_uuid: userId })

    if (!userRole) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Si es admin (no superadmin), no puede editar superadmins
    if (currentRole === ROLES.ADMIN && userRole === ROLES.SUPERADMIN) {
      return NextResponse.json(
        { error: 'You cannot edit SuperAdmin users' },
        { status: 403 }
      )
    }

    // Actualizar en auth.users si hay email o password
    if (email || password) {
      const updates: any = {}
      if (email) updates.email = email
      if (password) updates.password = password

      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        updates
      )

      if (authError) {
        throw new Error(`Failed to update auth: ${authError.message}`)
      }
    }

    // Actualizar full_name en metadata
    if (full_name) {
      const { error: metaError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { full_name }
        }
      )

      if (metaError) {
        throw new Error(`Failed to update metadata: ${metaError.message}`)
      }
    }

    // Actualizar en la tabla correspondiente
    if (userRole === ROLES.SUPERADMIN || userRole === ROLES.ADMIN) {
      // Actualizar system_users
      const updates: any = {}
      if (full_name) updates.full_name = full_name
      if (email) updates.email = email
      if (is_active !== undefined) updates.is_active = is_active

      const { error } = await supabase
        .from('system_users')
        .update(updates)
        .eq('user_id', userId)

      if (error) throw error
    } else if (userRole === ROLES.MANAGER || userRole === ROLES.BASE) {
      // Actualizar branch_users
      const updates: any = {}
      if (is_active !== undefined) updates.is_active = is_active

      const { error } = await supabase
        .from('branch_users')
        .update(updates)
        .eq('user_id', userId)

      if (error) throw error
    }

    return NextResponse.json({
      message: 'User updated successfully',
    })

  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

// =====================================================================
// DELETE /api/admin/users/[id]
// =====================================================================

export async function DELETE(
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

  const { user: currentUser, role: currentRole } = authResult
  const supabase = await createClient()
  const userId = params.id

  try {
    // No puede eliminarse a sí mismo
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Obtener rol del usuario a eliminar
    const { data: userRole } = await supabase
      .rpc('get_user_role', { user_uuid: userId })

    if (!userRole) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Si es admin (no superadmin), no puede eliminar superadmins
    if (currentRole === ROLES.ADMIN && userRole === ROLES.SUPERADMIN) {
      return NextResponse.json(
        { error: 'You cannot delete SuperAdmin users' },
        { status: 403 }
      )
    }

    // Eliminar de auth.users (cascade eliminará de system_users y branch_users)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`)
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    })

  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
