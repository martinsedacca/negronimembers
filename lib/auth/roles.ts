// =====================================================================
// TIPOS Y CONSTANTES DE ROLES
// =====================================================================

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  BASE: 'base',
  MEMBER: 'member',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// =====================================================================
// PERMISOS POR ROL
// =====================================================================

export const PERMISSIONS = {
  // System Users Management
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_ADMINS: 'view_admins',
  CREATE_SUPERADMIN: 'create_superadmin',
  CREATE_ADMIN: 'create_admin',
  CREATE_MANAGER: 'create_manager',
  CREATE_BASE: 'create_base',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Promotions/Benefits
  VIEW_ALL_PROMOTIONS: 'view_all_promotions',
  CREATE_PROMOTIONS: 'create_promotions',
  EDIT_OWN_PROMOTIONS: 'edit_own_promotions',
  EDIT_ALL_PROMOTIONS: 'edit_all_promotions',
  DELETE_OWN_PROMOTIONS: 'delete_own_promotions',
  DELETE_ALL_PROMOTIONS: 'delete_all_promotions',
  
  // Codes
  VIEW_ALL_CODES: 'view_all_codes',
  CREATE_CODES: 'create_codes',
  EDIT_OWN_CODES: 'edit_own_codes',
  EDIT_ALL_CODES: 'edit_all_codes',
  DELETE_OWN_CODES: 'delete_own_codes',
  DELETE_ALL_CODES: 'delete_all_codes',
  
  // Members
  VIEW_ALL_MEMBERS: 'view_all_members',
  VIEW_BRANCH_MEMBERS: 'view_branch_members',
  CREATE_MEMBERS: 'create_members',
  EDIT_MEMBERS: 'edit_members',
  DELETE_MEMBERS: 'delete_members',
  
  // Events
  CREATE_EVENTS: 'create_events',
  EDIT_EVENTS: 'edit_events',
  DELETE_EVENTS: 'delete_events',
  
  // Branches
  VIEW_ALL_BRANCHES: 'view_all_branches',
  MANAGE_BRANCHES: 'manage_branches',
  
  // Scanner/Operations
  SCAN_QR: 'scan_qr',
  REGISTER_ACTIONS: 'register_actions',
  
  // Member-only
  VIEW_OWN_DATA: 'view_own_data',
  REDEEM_PROMOTIONS: 'redeem_promotions',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// =====================================================================
// MAPA DE PERMISOS POR ROL
// =====================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.SUPERADMIN]: [
    // SuperAdmin tiene TODOS los permisos
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.CREATE_SUPERADMIN,
    PERMISSIONS.CREATE_ADMIN,
    PERMISSIONS.CREATE_MANAGER,
    PERMISSIONS.CREATE_BASE,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_ALL_PROMOTIONS,
    PERMISSIONS.CREATE_PROMOTIONS,
    PERMISSIONS.EDIT_ALL_PROMOTIONS,
    PERMISSIONS.DELETE_ALL_PROMOTIONS,
    PERMISSIONS.VIEW_ALL_CODES,
    PERMISSIONS.CREATE_CODES,
    PERMISSIONS.EDIT_ALL_CODES,
    PERMISSIONS.DELETE_ALL_CODES,
    PERMISSIONS.VIEW_ALL_MEMBERS,
    PERMISSIONS.CREATE_MEMBERS,
    PERMISSIONS.EDIT_MEMBERS,
    PERMISSIONS.DELETE_MEMBERS,
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.EDIT_EVENTS,
    PERMISSIONS.DELETE_EVENTS,
    PERMISSIONS.VIEW_ALL_BRANCHES,
    PERMISSIONS.MANAGE_BRANCHES,
    PERMISSIONS.SCAN_QR,
    PERMISSIONS.REGISTER_ACTIONS,
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.VIEW_ADMINS,
    // NO puede crear superadmins
    PERMISSIONS.CREATE_ADMIN,
    PERMISSIONS.CREATE_MANAGER,
    PERMISSIONS.CREATE_BASE,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_ALL_PROMOTIONS,
    PERMISSIONS.CREATE_PROMOTIONS,
    PERMISSIONS.EDIT_ALL_PROMOTIONS,
    PERMISSIONS.DELETE_ALL_PROMOTIONS,
    PERMISSIONS.VIEW_ALL_CODES,
    PERMISSIONS.CREATE_CODES,
    PERMISSIONS.EDIT_ALL_CODES,
    PERMISSIONS.DELETE_ALL_CODES,
    PERMISSIONS.VIEW_ALL_MEMBERS,
    PERMISSIONS.CREATE_MEMBERS,
    PERMISSIONS.EDIT_MEMBERS,
    PERMISSIONS.DELETE_MEMBERS,
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.EDIT_EVENTS,
    PERMISSIONS.DELETE_EVENTS,
    PERMISSIONS.VIEW_ALL_BRANCHES,
    PERMISSIONS.MANAGE_BRANCHES,
    PERMISSIONS.SCAN_QR,
    PERMISSIONS.REGISTER_ACTIONS,
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ALL_PROMOTIONS,
    PERMISSIONS.CREATE_PROMOTIONS,
    PERMISSIONS.EDIT_OWN_PROMOTIONS,
    PERMISSIONS.DELETE_OWN_PROMOTIONS,
    PERMISSIONS.CREATE_CODES,
    PERMISSIONS.EDIT_OWN_CODES,
    PERMISSIONS.DELETE_OWN_CODES,
    PERMISSIONS.VIEW_BRANCH_MEMBERS,
    PERMISSIONS.CREATE_MEMBERS,
    PERMISSIONS.EDIT_MEMBERS,
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.EDIT_EVENTS,
    PERMISSIONS.SCAN_QR,
    PERMISSIONS.REGISTER_ACTIONS,
  ],
  
  [ROLES.BASE]: [
    PERMISSIONS.VIEW_BRANCH_MEMBERS,
    PERMISSIONS.CREATE_MEMBERS,
    PERMISSIONS.SCAN_QR,
    PERMISSIONS.REGISTER_ACTIONS,
  ],
  
  [ROLES.MEMBER]: [
    PERMISSIONS.VIEW_OWN_DATA,
    PERMISSIONS.REDEEM_PROMOTIONS,
  ],
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Verifica si un rol puede crear otro rol
 */
export function canCreateRole(userRole: UserRole, targetRole: UserRole): boolean {
  if (userRole === ROLES.SUPERADMIN) return true
  if (userRole === ROLES.ADMIN && targetRole !== ROLES.SUPERADMIN) return true
  return false
}

/**
 * Obtiene roles que un usuario puede crear
 */
export function getCreatableRoles(userRole: UserRole): UserRole[] {
  if (userRole === ROLES.SUPERADMIN) {
    return [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.BASE]
  }
  if (userRole === ROLES.ADMIN) {
    return [ROLES.ADMIN, ROLES.MANAGER, ROLES.BASE]
  }
  return []
}

/**
 * Verifica si un rol es admin (superadmin o admin)
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === ROLES.SUPERADMIN || role === ROLES.ADMIN
}

/**
 * Verifica si un rol es staff (manager o base)
 */
export function isStaff(role: UserRole | null): boolean {
  return role === ROLES.MANAGER || role === ROLES.BASE
}

// =====================================================================
// LABELS Y COLORES PARA UI
// =====================================================================

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.SUPERADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.BASE]: 'Staff',
  [ROLES.MEMBER]: 'Member',
}

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  [ROLES.SUPERADMIN]: { bg: 'bg-red-500/10', text: 'text-red-500' },
  [ROLES.ADMIN]: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  [ROLES.MANAGER]: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  [ROLES.BASE]: { bg: 'bg-green-500/10', text: 'text-green-500' },
  [ROLES.MEMBER]: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
}

export const ROLE_ICONS: Record<UserRole, string> = {
  [ROLES.SUPERADMIN]: '🔴',
  [ROLES.ADMIN]: '🟠',
  [ROLES.MANAGER]: '🟡',
  [ROLES.BASE]: '🟢',
  [ROLES.MEMBER]: '🔵',
}

// =====================================================================
// TIPOS DE BASE DE DATOS
// =====================================================================

export interface SystemUser {
  id: string
  user_id: string
  role: 'superadmin' | 'admin'
  full_name: string
  email: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface BranchUser {
  id: string
  user_id: string
  branch_id: string
  role: 'manager' | 'base'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  full_name?: string
  branches?: {
    id: string
    name: string
  }[]
  is_active: boolean
  created_at: string
}
