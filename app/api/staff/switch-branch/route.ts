import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get session token from header
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '')

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token provided' }, { status: 401 })
    }

    const { branch_id } = await request.json()
    if (!branch_id) {
      return NextResponse.json({ error: 'branch_id is required' }, { status: 400 })
    }

    // Single query: Get session + staff + branch access in one go
    const { data: session, error: sessionError } = await supabase
      .from('staff_sessions')
      .select(`
        staff_id,
        staff_members!inner (
          id, role, is_active,
          staff_branch_access (branch_id)
        )
      `)
      .eq('session_token', sessionToken)
      .is('ended_at', null)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const staff = session.staff_members as any
    if (!staff?.is_active) {
      return NextResponse.json({ error: 'Staff inactive' }, { status: 401 })
    }

    // Check branch access from the joined data
    const hasAccess = staff.staff_branch_access?.some((a: any) => a.branch_id === branch_id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this branch' }, { status: 403 })
    }

    // Servers with multiple branches cannot switch
    if (staff.role === 'server' && staff.staff_branch_access?.length > 1) {
      return NextResponse.json({ error: 'Servers cannot switch branches' }, { status: 403 })
    }

    // Get branch details first (we need to return it anyway)
    const { data: branch } = await supabase
      .from('branches')
      .select('id, name, address, city')
      .eq('id', branch_id)
      .single()

    // Update staff and session in parallel (fire and forget for speed)
    supabase.from('staff_members').update({ current_branch_id: branch_id }).eq('id', staff.id).then(() => {})
    supabase.from('staff_sessions').update({ branch_id }).eq('session_token', sessionToken).then(() => {})

    return NextResponse.json({
      success: true,
      current_branch: branch,
      message: `Switched to ${branch?.name}`,
    })
  } catch (error: any) {
    console.error('Switch branch error:', error)
    return NextResponse.json({ error: 'Failed to switch branch' }, { status: 500 })
  }
}
