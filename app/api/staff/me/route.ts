import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get session token from header
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '')

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      )
    }

    // Get active session
    const { data: session, error: sessionError } = await supabase
      .from('staff_sessions')
      .select(`
        id,
        staff_id,
        branch_id,
        started_at,
        last_activity_at
      `)
      .eq('session_token', sessionToken)
      .is('ended_at', null)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check session age (8 hours max)
    const sessionAge = Date.now() - new Date(session.last_activity_at).getTime()
    const maxAge = 8 * 60 * 60 * 1000 // 8 hours in ms
    
    if (sessionAge > maxAge) {
      // End expired session
      await supabase
        .from('staff_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', session.id)
      
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Update last activity
    await supabase
      .from('staff_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id)

    // Get staff info
    const { data: staff, error: staffError } = await supabase
      .from('staff_members')
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        current_branch_id,
        is_active
      `)
      .eq('id', session.staff_id)
      .single()

    if (staffError || !staff || !staff.is_active) {
      return NextResponse.json(
        { error: 'Staff not found or inactive' },
        { status: 401 }
      )
    }

    // Get assigned branches
    const { data: branchAccess } = await supabase
      .from('staff_branch_access')
      .select(`
        branch_id,
        branches (
          id,
          name,
          address,
          city
        )
      `)
      .eq('staff_id', staff.id)

    const assignedBranches = branchAccess?.map(ba => ba.branches).filter(Boolean) || []

    // Get current branch details
    let currentBranch = null
    if (staff.current_branch_id) {
      const { data: branch } = await supabase
        .from('branches')
        .select('id, name, address, city')
        .eq('id', staff.current_branch_id)
        .single()
      currentBranch = branch
    }

    return NextResponse.json({
      staff: {
        id: staff.id,
        full_name: staff.full_name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
      },
      current_branch: currentBranch,
      assigned_branches: assignedBranches,
      session: {
        id: session.id,
        started_at: session.started_at,
      },
    })
  } catch (error: any) {
    console.error('Staff me error:', error)
    return NextResponse.json(
      { error: 'Failed to get staff info', details: error.message },
      { status: 500 }
    )
  }
}
