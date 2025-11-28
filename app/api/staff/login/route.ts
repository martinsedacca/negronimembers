import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { last_name, pin } = await request.json()

    if (!last_name || last_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      )
    }

    if (!pin || pin.length !== 6) {
      return NextResponse.json(
        { error: 'PIN must be 6 digits' },
        { status: 400 }
      )
    }

    // Find staff by last_name + PIN
    const { data: staff, error: staffError } = await supabase
      .from('staff_members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        current_branch_id,
        is_active
      `)
      .ilike('last_name', last_name.trim())
      .eq('pin', pin)
      .eq('is_active', true)
      .single()

    if (staffError || !staff) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
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

    // If server with only one branch, auto-select it
    let currentBranchId = staff.current_branch_id
    if (!currentBranchId && assignedBranches.length === 1) {
      currentBranchId = (assignedBranches[0] as any).id
      
      // Update current_branch_id
      await supabase
        .from('staff_members')
        .update({ current_branch_id: currentBranchId })
        .eq('id', staff.id)
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex')

    // Get request info
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0] || 'unknown'

    // Create session
    const { error: sessionError } = await supabase
      .from('staff_sessions')
      .insert({
        staff_id: staff.id,
        branch_id: currentBranchId,
        session_token: sessionToken,
        user_agent: userAgent,
        ip_address: ipAddress,
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update last login
    await supabase
      .from('staff_members')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', staff.id)

    // Determine if branch selection is needed
    const needsBranchSelection = !currentBranchId && assignedBranches.length > 1

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      staff: {
        id: staff.id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        full_name: `${staff.first_name} ${staff.last_name}`,
        email: staff.email,
        role: staff.role,
        current_branch_id: currentBranchId,
      },
      assigned_branches: assignedBranches,
      needs_branch_selection: needsBranchSelection,
    })
  } catch (error: any) {
    console.error('Staff login error:', error)
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    )
  }
}
