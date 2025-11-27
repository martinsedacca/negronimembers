// =====================================================================
// API ROUTE: /api/admin/users
// =====================================================================
// GET - Listar usuarios (filtrado por rol del usuario actual)
// POST - Crear nuevo usuario
// =====================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/permissions'
import { ROLES, canCreateRole, isAdmin, type UserRole } from '@/lib/auth/roles'

// =====================================================================
// GET /api/admin/users
// =====================================================================

export async function GET(request: Request) {
  // Verificar que es admin
  const authResult = await verifyAdmin()
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user, role } = authResult
  const supabase = await createClient()

  try {
    // Parse query params
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')
    const search = searchParams.get('search')
    const isActiveFilter = searchParams.get('is_active')

    // Obtener system_users (superadmin y admin)
    let systemUsersQuery = supabase
      .from('system_users')
      .select(`
        id,
        user_id,
        role,
        full_name,
        email,
        is_active,
        created_at,
        updated_at
      `)

    // Si es Admin (no SuperAdmin), no puede ver SuperAdmins
    if (role === ROLES.ADMIN) {
      systemUsersQuery = systemUsersQuery.eq('role', 'admin')
    }

    // Filtros
    if (roleFilter && ['superadmin', 'admin'].includes(roleFilter)) {
      systemUsersQuery = systemUsersQuery.eq('role', roleFilter)
    }

    if (isActiveFilter !== null) {
      systemUsersQuery = systemUsersQuery.eq('is_active', isActiveFilter === 'true')
    }

    if (search) {
      systemUsersQuery = systemUsersQuery.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data: systemUsers, error: systemError } = await systemUsersQuery

    if (systemError) throw systemError

    // Obtener branch_users (manager y base)
    let branchUsersQuery = supabase
      .from('branch_users')
      .select(`
        id,
        user_id,
        branch_id,
        role,
        is_active,
        created_at,
        updated_at,
        branches (
          id,
          name
        )
      `)

    // Filtros
    if (roleFilter && ['manager', 'base'].includes(roleFilter)) {
      branchUsersQuery = branchUsersQuery.eq('role', roleFilter)
    }

    if (isActiveFilter !== null) {
      branchUsersQuery = branchUsersQuery.eq('is_active', isActiveFilter === 'true')
    }

    const { data: branchUsers, error: branchError } = await branchUsersQuery

    if (branchError) throw branchError

    // Obtener info de auth.users para branch_users
    const branchUserIds = branchUsers?.map(bu => bu.user_id) || []
    let authUsers: any[] = []

    if (branchUserIds.length > 0) {
      // Obtener emails de auth.users
      const { data: authData } = await supabase.auth.admin.listUsers()
      authUsers = authData?.users.filter(u => branchUserIds.includes(u.id)) || []
    }

    // Combinar datos
    const allUsers = [
      // System users
      ...(systemUsers || []).map(su => ({
        id: su.user_id,
        email: su.email,
        full_name: su.full_name,
        role: su.role as UserRole,
        is_active: su.is_active,
        created_at: su.created_at,
        updated_at: su.updated_at,
        branches: null,
      })),
      // Branch users
      ...(branchUsers || []).map(bu => {
        const authUser = authUsers.find(u => u.id === bu.user_id)
        return {
          id: bu.user_id,
          email: authUser?.email || '',
          full_name: authUser?.user_metadata?.full_name || '',
          role: bu.role as UserRole,
          is_active: bu.is_active,
          created_at: bu.created_at,
          updated_at: bu.updated_at,
          branches: bu.branches ? [bu.branches] : [],
        }
      }),
    ]

    // Aplicar búsqueda si existe (para branch users)
    let filteredUsers = allUsers
    if (search) {
      filteredUsers = allUsers.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredUsers.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ users: filteredUsers })

  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// =====================================================================
// POST /api/admin/users
// =====================================================================

export async function POST(request: Request) {
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

  try {
    const body = await request.json()
    const {
      email,
      password,
      full_name,
      role,
      branch_ids, // Array de branch IDs (solo para manager/base)
    } = body

    // Validaciones
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, full_name, role' },
        { status: 400 }
      )
    }

    // Verificar que puede crear ese rol
    if (!canCreateRole(currentRole, role)) {
      return NextResponse.json(
        { error: `You don't have permission to create ${role} users` },
        { status: 403 }
      )
    }

    // Si es manager o base, debe tener al menos 1 sucursal
    if ((role === ROLES.MANAGER || role === ROLES.BASE) && (!branch_ids || branch_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Managers and staff must be assigned to at least one branch' },
        { status: 400 }
      )
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    const newUserId = authData.user.id

    // Crear entrada según el rol
    if (role === ROLES.SUPERADMIN || role === ROLES.ADMIN) {
      // Crear en system_users
      const { error: systemUserError } = await supabase
        .from('system_users')
        .insert({
          user_id: newUserId,
          role,
          full_name,
          email,
          is_active: true,
          created_by: currentUser.id,
        })

      if (systemUserError) {
        // Rollback: eliminar usuario de auth
        await supabase.auth.admin.deleteUser(newUserId)
        throw new Error(`Failed to create system user: ${systemUserError.message}`)
      }
    } else if (role === ROLES.MANAGER || role === ROLES.BASE) {
      // Crear en branch_users para cada sucursal
      const branchUserInserts = branch_ids.map((branchId: string) => ({
        user_id: newUserId,
        branch_id: branchId,
        role,
        is_active: true,
      }))

      const { error: branchUserError } = await supabase
        .from('branch_users')
        .insert(branchUserInserts)

      if (branchUserError) {
        // Rollback: eliminar usuario de auth
        await supabase.auth.admin.deleteUser(newUserId)
        throw new Error(`Failed to create branch user: ${branchUserError.message}`)
      }
    } else {
      // Rol inválido
      await supabase.auth.admin.deleteUser(newUserId)
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Obtener el usuario creado con toda su info
    const { data: createdUser } = await supabase
      .rpc('get_user_role', { user_uuid: newUserId })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUserId,
        email,
        full_name,
        role,
        is_active: true,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
