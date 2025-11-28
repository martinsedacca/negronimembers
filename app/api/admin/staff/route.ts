import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all staff
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminCheck } = await supabase
      .from('system_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck || !['superadmin', 'admin'].includes(adminCheck.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all staff with their branches
    const { data: staff, error } = await supabase
      .from('staff_members')
      .select(`
        *,
        staff_branch_access (
          branch_id,
          branches (
            id,
            name
          )
        ),
        current_branch:branches!staff_members_current_branch_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data
    const transformedStaff = staff?.map(s => ({
      ...s,
      assigned_branches: s.staff_branch_access?.map((sba: any) => sba.branches).filter(Boolean) || [],
      staff_branch_access: undefined, // Remove raw data
    }))

    return NextResponse.json({ staff: transformedStaff })
  } catch (error: any) {
    console.error('Get staff error:', error)
    return NextResponse.json(
      { error: 'Failed to get staff', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new staff
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminCheck } = await supabase
      .from('system_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck || !['superadmin', 'admin'].includes(adminCheck.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { first_name, last_name, email, phone, role, pin, branch_ids } = body

    // Validate required fields
    if (!first_name || !last_name || !role || !pin) {
      return NextResponse.json(
        { error: 'first_name, last_name, role, and pin are required' },
        { status: 400 }
      )
    }

    // Validate PIN
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Check PIN uniqueness
    const { data: existingPin } = await supabase
      .from('staff_members')
      .select('id')
      .eq('pin', pin)
      .single()

    if (existingPin) {
      return NextResponse.json(
        { error: 'This PIN is already in use' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['manager', 'server'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be manager or server' },
        { status: 400 }
      )
    }

    // Validate branches for server (must have exactly one)
    if (role === 'server' && (!branch_ids || branch_ids.length !== 1)) {
      return NextResponse.json(
        { error: 'Servers must be assigned to exactly one branch' },
        { status: 400 }
      )
    }

    // Create staff member
    const { data: newStaff, error: staffError } = await supabase
      .from('staff_members')
      .insert({
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        email,
        phone,
        role,
        pin,
        created_by: user.id,
        current_branch_id: branch_ids?.length === 1 ? branch_ids[0] : null,
      })
      .select()
      .single()

    if (staffError) throw staffError

    // Assign branches
    if (branch_ids && branch_ids.length > 0) {
      const branchAccess = branch_ids.map((branch_id: string) => ({
        staff_id: newStaff.id,
        branch_id,
      }))

      const { error: accessError } = await supabase
        .from('staff_branch_access')
        .insert(branchAccess)

      if (accessError) throw accessError
    }

    return NextResponse.json({
      success: true,
      staff: newStaff,
    })
  } catch (error: any) {
    console.error('Create staff error:', error)
    return NextResponse.json(
      { error: 'Failed to create staff', details: error.message },
      { status: 500 }
    )
  }
}
