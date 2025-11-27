// =====================================================================
// MIDDLEWARE Y HELPERS DE PERMISOS
// =====================================================================

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole, Permission } from './roles'
import { ROLES, hasPermission, isAdmin } from './roles'

// =====================================================================
// GET USER ROLE
// =====================================================================

/**
 * Obtiene el rol del usuario actual desde la base de datos
 */
export async function getUserRole(): Promise<{
  user: any
  role: UserRole | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, role: null }
  }

  // Llamar a la función SQL get_user_role
  const { data: roleData, error } = await supabase
    .rpc('get_user_role', { user_uuid: user.id })

  if (error) {
    console.error('Error getting user role:', error)
    return { user, role: null }
  }

  return { user, role: roleData as UserRole }
}

// =====================================================================
// REQUIRE AUTHENTICATION
// =====================================================================

/**
 * Requiere que el usuario esté autenticado
 * Redirige a /login si no lo está
 */
export async function requireAuth() {
  const { user } = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

// =====================================================================
// REQUIRE ROLE
// =====================================================================

/**
 * Requiere que el usuario tenga uno de los roles especificados
 * Redirige a /unauthorized si no tiene el rol
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { user, role } = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (!role || !allowedRoles.includes(role)) {
    redirect('/unauthorized')
  }

  return { user, role }
}

// =====================================================================
// REQUIRE ADMIN
// =====================================================================

/**
 * Requiere que el usuario sea admin (superadmin o admin)
 * Redirige a /unauthorized si no lo es
 */
export async function requireAdmin() {
  const { user, role } = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (!role || !isAdmin(role)) {
    redirect('/unauthorized')
  }

  return { user, role }
}

// =====================================================================
// REQUIRE PERMISSION
// =====================================================================

/**
 * Requiere que el usuario tenga un permiso específico
 * Redirige a /unauthorized si no lo tiene
 */
export async function requirePermission(permission: Permission) {
  const { user, role } = await getUserRole()

  if (!user) {
    redirect('/auth/login')
  }

  if (!role || !hasPermission(role, permission)) {
    redirect('/unauthorized')
  }

  return { user, role }
}

// =====================================================================
// CHECK PERMISSION (NO REDIRECT)
// =====================================================================

/**
 * Verifica si el usuario tiene un permiso específico
 * No redirige, solo retorna true/false
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const { role } = await getUserRole()
  
  if (!role) return false
  
  return hasPermission(role, permission)
}

// =====================================================================
// GET USER BRANCHES
// =====================================================================

/**
 * Obtiene las sucursales asignadas al usuario
 * Admins obtienen todas las sucursales
 */
export async function getUserBranches(): Promise<{
  branch_id: string
  branch_name: string
  user_role: string
}[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Llamar a la función SQL get_user_branches
  const { data, error } = await supabase
    .rpc('get_user_branches', { user_uuid: user.id })

  if (error) {
    console.error('Error getting user branches:', error)
    return []
  }

  return data || []
}

// =====================================================================
// CAN EDIT PROMOTION
// =====================================================================

/**
 * Verifica si el usuario puede editar una promoción específica
 */
export async function canEditPromotion(promotionId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // Llamar a la función SQL can_edit_promotion
  const { data, error } = await supabase
    .rpc('can_edit_promotion', {
      user_uuid: user.id,
      promotion_uuid: promotionId
    })

  if (error) {
    console.error('Error checking promotion edit permission:', error)
    return false
  }

  return data === true
}

// =====================================================================
// HELPERS PARA API ROUTES
// =====================================================================

/**
 * Verifica autenticación en API route
 * Retorna { error, status } si falla, o { user, role } si éxito
 */
export async function verifyAuth(): Promise<
  | { error: string; status: number; user?: never; role?: never }
  | { user: any; role: UserRole; error?: never; status?: never }
> {
  const { user, role } = await getUserRole()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (!role) {
    return { error: 'User has no role assigned', status: 403 }
  }

  return { user, role }
}

/**
 * Verifica que el usuario sea admin en API route
 */
export async function verifyAdmin(): Promise<
  | { error: string; status: number; user?: never; role?: never }
  | { user: any; role: UserRole; error?: never; status?: never }
> {
  const result = await verifyAuth()

  if ('error' in result) {
    return result
  }

  if (!isAdmin(result.role)) {
    return { error: 'Admin access required', status: 403 }
  }

  return result
}

/**
 * Verifica permiso específico en API route
 */
export async function verifyPermission(permission: Permission): Promise<
  | { error: string; status: number; user?: never; role?: never }
  | { user: any; role: UserRole; error?: never; status?: never }
> {
  const result = await verifyAuth()

  if ('error' in result) {
    return result
  }

  if (!hasPermission(result.role, permission)) {
    return { error: `Permission required: ${permission}`, status: 403 }
  }

  return result
}

// =====================================================================
// USER INFO HELPER
// =====================================================================

export interface UserInfo {
  id: string
  email: string
  role: UserRole
  fullName?: string
  branches: {
    id: string
    name: string
    role?: string
  }[]
  permissions: Permission[]
}

/**
 * Obtiene información completa del usuario actual
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  const { user, role } = await getUserRole()

  if (!user || !role) return null

  const branches = await getUserBranches()

  // Obtener nombre del usuario
  let fullName: string | undefined

  const supabase = await createClient()

  if (isAdmin(role)) {
    // Buscar en system_users
    const { data } = await supabase
      .from('system_users')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    fullName = data?.full_name
  } else if (role === ROLES.MANAGER || role === ROLES.BASE) {
    // Buscar en auth.users metadata
    fullName = user.user_metadata?.full_name
  } else if (role === ROLES.MEMBER) {
    // Buscar en members
    const { data } = await supabase
      .from('members')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    fullName = data?.full_name
  }

  return {
    id: user.id,
    email: user.email!,
    role,
    fullName,
    branches: branches.map(b => ({
      id: b.branch_id,
      name: b.branch_name,
      role: b.user_role !== 'all_access' ? b.user_role : undefined
    })),
    permissions: [], // TODO: implementar si usamos user_permissions table
  }
}
