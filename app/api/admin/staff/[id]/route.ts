import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get single staff
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      .eq('id', id)
      .single()

    if (error) throw error

    // Transform data
    const transformedStaff = {
      ...staff,
      assigned_branches: staff.staff_branch_access?.map((sba: any) => sba.branches).filter(Boolean) || [],
      branch_ids: staff.staff_branch_access?.map((sba: any) => sba.branch_id) || [],
      staff_branch_access: undefined,
    }

    return NextResponse.json({ staff: transformedStaff })
  } catch (error: any) {
    console.error('Get staff error:', error)
    return NextResponse.json(
      { error: 'Failed to get staff', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update staff
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { first_name, last_name, email, phone, role, pin, branch_ids, is_active } = body

    // Validate PIN if provided
    if (pin && !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Check PIN uniqueness if changing
    if (pin) {
      const { data: existingPin } = await supabase
        .from('staff_members')
        .select('id')
        .eq('pin', pin)
        .neq('id', id)
        .single()

      if (existingPin) {
        return NextResponse.json(
          { error: 'This PIN is already in use' },
          { status: 400 }
        )
      }
    }

    // Validate branches for server
    if (role === 'server' && branch_ids && branch_ids.length !== 1) {
      return NextResponse.json(
        { error: 'Servers must be assigned to exactly one branch' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (first_name !== undefined || last_name !== undefined) {
      // Update full_name if either name changed
      const newFirstName = first_name || ''
      const newLastName = last_name || ''
      updateData.full_name = `${newFirstName} ${newLastName}`.trim()
    }
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role
    if (pin !== undefined) updateData.pin = pin
    if (is_active !== undefined) updateData.is_active = is_active

    // Update staff member
    const { data: updatedStaff, error: staffError } = await supabase
      .from('staff_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (staffError) throw staffError

    // Update branch assignments if provided
    if (branch_ids !== undefined) {
      // Delete existing assignments
      await supabase
        .from('staff_branch_access')
        .delete()
        .eq('staff_id', id)

      // Insert new assignments
      if (branch_ids.length > 0) {
        const branchAccess = branch_ids.map((branch_id: string) => ({
          staff_id: id,
          branch_id,
        }))

        const { error: accessError } = await supabase
          .from('staff_branch_access')
          .insert(branchAccess)

        if (accessError) throw accessError
      }

      // Update current_branch_id if needed
      if (branch_ids.length === 1) {
        await supabase
          .from('staff_members')
          .update({ current_branch_id: branch_ids[0] })
          .eq('id', id)
      } else if (!branch_ids.includes(updatedStaff.current_branch_id)) {
        await supabase
          .from('staff_members')
          .update({ current_branch_id: null })
          .eq('id', id)
      }
    }

    return NextResponse.json({
      success: true,
      staff: updatedStaff,
    })
  } catch (error: any) {
    console.error('Update staff error:', error)
    return NextResponse.json(
      { error: 'Failed to update staff', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate staff
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Deactivate (don't delete, to preserve history)
    const { error } = await supabase
      .from('staff_members')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    // End all active sessions
    await supabase
      .from('staff_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('staff_id', id)
      .is('ended_at', null)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete staff error:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff', details: error.message },
      { status: 500 }
    )
  }
}
