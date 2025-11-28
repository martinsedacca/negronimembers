import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export interface StaffSession {
  staff_id: string
  staff: {
    id: string
    full_name: string
    email: string | null
    role: 'manager' | 'server'
    current_branch_id: string | null
  }
  branch_id: string | null
  session_id: string
}

export async function getStaffSession(request: NextRequest): Promise<StaffSession | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '')

    if (!sessionToken) {
      return null
    }

    const supabase = await createClient()

    // Get active session
    const { data: session, error: sessionError } = await supabase
      .from('staff_sessions')
      .select(`
        id,
        staff_id,
        branch_id,
        last_activity_at
      `)
      .eq('session_token', sessionToken)
      .is('ended_at', null)
      .single()

    if (sessionError || !session) {
      return null
    }

    // Check session age (8 hours max)
    const sessionAge = Date.now() - new Date(session.last_activity_at).getTime()
    const maxAge = 8 * 60 * 60 * 1000 // 8 hours
    
    if (sessionAge > maxAge) {
      // End expired session
      await supabase
        .from('staff_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', session.id)
      return null
    }

    // Get staff info
    const { data: staff, error: staffError } = await supabase
      .from('staff_members')
      .select(`
        id,
        full_name,
        email,
        role,
        current_branch_id,
        is_active
      `)
      .eq('id', session.staff_id)
      .single()

    if (staffError || !staff || !staff.is_active) {
      return null
    }

    // Update last activity (don't await, fire and forget)
    supabase
      .from('staff_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id)
      .then(() => {})

    return {
      staff_id: staff.id,
      staff: {
        id: staff.id,
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role as 'manager' | 'server',
        current_branch_id: staff.current_branch_id,
      },
      branch_id: staff.current_branch_id,
      session_id: session.id,
    }
  } catch (error) {
    console.error('Staff auth error:', error)
    return null
  }
}

export async function requireStaffSession(request: NextRequest): Promise<{
  session: StaffSession | null
  error: { error: string; status: number } | null
}> {
  const session = await getStaffSession(request)
  
  if (!session) {
    return {
      session: null,
      error: { error: 'Unauthorized - Invalid or expired session', status: 401 }
    }
  }

  if (!session.branch_id) {
    return {
      session: null,
      error: { error: 'No branch selected', status: 400 }
    }
  }

  return { session, error: null }
}
