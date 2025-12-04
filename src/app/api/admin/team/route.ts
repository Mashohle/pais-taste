import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEAM API] GET request - using updated code with separate queries')
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('business_id')

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing required parameter: business_id' },
        { status: 400 }
      )
    }

    // Get user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify business access
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('id, role, is_active')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!businessUser) {
      return NextResponse.json(
        { error: 'You do not have access to this business' },
        { status: 403 }
      )
    }

    // Fetch all team members for this business
    const { data: teamMembers, error: teamError } = await supabase
      .from('business_users')
      .select(`
        id,
        business_id,
        user_id,
        role,
        permissions,
        is_active,
        created_at,
        updated_at
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (teamError) {
      console.error('Error fetching team members:', teamError)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    // Fetch profile data for each team member
    const userIds = (teamMembers || []).map(m => m.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .in('id', userIds)

    // Create a map for easy profile lookup
    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // Transform data to combine team member and profile info
    const formattedTeamMembers = (teamMembers || []).map((member) => {
      const profile = profileMap.get(member.user_id)
      return {
        id: member.id,
        business_id: member.business_id,
        user_id: member.user_id,
        role: member.role,
        permissions: member.permissions,
        is_active: member.is_active,
        created_at: member.created_at,
        updated_at: member.updated_at,
        email: profile?.email || 'N/A',
        full_name: profile?.full_name || 'Unknown User',
        avatar_url: profile?.avatar_url || null,
      }
    })

    return NextResponse.json({ data: formattedTeamMembers })
  } catch (error: unknown) {
    console.error('Team GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch team members',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { business_id, email, role, permissions } = body

    if (!business_id || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, email, role' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['owner', 'admin', 'staff', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: owner, admin, staff, or viewer' },
        { status: 400 }
      )
    }

    // Get user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify requester has permission
    const { data: requesterUser } = await supabase
      .from('business_users')
      .select('id, role, is_active, permissions')
      .eq('user_id', user.id)
      .eq('business_id', business_id)
      .eq('is_active', true)
      .single()

    if (!requesterUser) {
      return NextResponse.json(
        { error: 'You do not have access to this business' },
        { status: 403 }
      )
    }

    // Check permissions
    const requesterPermissions = requesterUser.permissions as Record<string, boolean> | null
    const isOwner = requesterUser.role === 'owner'
    const isAdmin = requesterUser.role === 'admin'
    const canManageStaff = requesterPermissions?.manage_staff || false

    // Only owners can create other owners
    if (role === 'owner' && !isOwner) {
      return NextResponse.json(
        { error: 'Only owners can add other owners' },
        { status: 403 }
      )
    }

    // Admins can only add staff and viewers
    if (isAdmin && ['owner', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Admins can only add Staff or Viewer roles' },
        { status: 403 }
      )
    }

    // Check if user has permission to manage staff
    if (!isOwner && !canManageStaff) {
      return NextResponse.json(
        { error: 'You do not have permission to manage team members' },
        { status: 403 }
      )
    }

    // Look up user by email in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!profile) {
      // User doesn't exist yet - in a full implementation, you'd send an invite email
      // For now, return a message
      return NextResponse.json(
        {
          error: 'User not found. In production, this would send an invite email.',
          message: 'User needs to sign up first, or implement invite system'
        },
        { status: 404 }
      )
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('business_users')
      .select('id, is_active')
      .eq('business_id', business_id)
      .eq('user_id', profile.id)
      .single()

    if (existingMember) {
      if (existingMember.is_active) {
        return NextResponse.json(
          { error: 'This user is already a team member' },
          { status: 400 }
        )
      } else {
        // Reactivate inactive user
        const { data: reactivated, error: reactivateError } = await supabase
          .from('business_users')
          .update({
            role,
            permissions,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingMember.id)
          .select()
          .single()

        if (reactivateError) {
          console.error('Error reactivating team member:', reactivateError)
          return NextResponse.json(
            { error: 'Failed to reactivate team member' },
            { status: 500 }
          )
        }

        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, full_name, avatar_url')
          .eq('id', reactivated.user_id)
          .single()

        return NextResponse.json({
          data: {
            ...reactivated,
            email: profileData?.email || email,
            full_name: profileData?.full_name || 'Unknown User',
            avatar_url: profileData?.avatar_url || null,
          },
          message: 'Team member reactivated successfully',
        })
      }
    }

    // Create new team member
    const { data: newMember, error: createError } = await supabase
      .from('business_users')
      .insert({
        business_id,
        user_id: profile.id,
        role,
        permissions: permissions || {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating team member:', createError)
      return NextResponse.json(
        { error: 'Failed to add team member' },
        { status: 500 }
      )
    }

    // Fetch profile data
    const { data: newProfileData } = await supabase
      .from('profiles')
      .select('email, full_name, avatar_url')
      .eq('id', newMember.user_id)
      .single()

    return NextResponse.json({
      data: {
        ...newMember,
        email: newProfileData?.email || email,
        full_name: newProfileData?.full_name || 'Unknown User',
        avatar_url: newProfileData?.avatar_url || null,
      },
      message: 'Team member added successfully',
    })
  } catch (error: unknown) {
    console.error('Team POST error:', error)
    return NextResponse.json(
      {
        error: 'Failed to add team member',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { member_id, business_id, role, permissions, is_active } = body

    if (!member_id || !business_id) {
      return NextResponse.json(
        { error: 'Missing required fields: member_id, business_id' },
        { status: 400 }
      )
    }

    // Get user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify requester has permission
    const { data: requesterUser } = await supabase
      .from('business_users')
      .select('id, role, is_active, permissions')
      .eq('user_id', user.id)
      .eq('business_id', business_id)
      .eq('is_active', true)
      .single()

    if (!requesterUser) {
      return NextResponse.json(
        { error: 'You do not have access to this business' },
        { status: 403 }
      )
    }

    // Check permissions
    const requesterPermissions = requesterUser.permissions as Record<string, boolean> | null
    const isOwner = requesterUser.role === 'owner'
    const canManageStaff = requesterPermissions?.manage_staff || false

    if (!isOwner && !canManageStaff) {
      return NextResponse.json(
        { error: 'You do not have permission to manage team members' },
        { status: 403 }
      )
    }

    // Get the member being updated
    const { data: targetMember } = await supabase
      .from('business_users')
      .select('user_id, role')
      .eq('id', member_id)
      .eq('business_id', business_id)
      .single()

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Prevent users from editing themselves - period. No exceptions.
    if (targetMember.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot edit your own profile. Another team member must make changes to your role or permissions.' },
        { status: 403 }
      )
    }

    // Only owners can edit other owners or promote to owner
    if ((targetMember.role === 'owner' || role === 'owner') && !isOwner) {
      return NextResponse.json(
        { error: 'Only owners can modify owner roles' },
        { status: 403 }
      )
    }

    // Admins cannot edit other admins
    const isAdmin = requesterUser.role === 'admin'
    if (isAdmin && (targetMember.role === 'admin' || role === 'admin')) {
      return NextResponse.json(
        { error: 'Admins cannot modify other admin roles' },
        { status: 403 }
      )
    }

    // Build update object
    const updates: {
      updated_at: string
      role?: string
      permissions?: Record<string, boolean>
      is_active?: boolean
    } = {
      updated_at: new Date().toISOString(),
    }

    if (role !== undefined) updates.role = role
    if (permissions !== undefined) updates.permissions = permissions
    if (is_active !== undefined) updates.is_active = is_active

    // Update team member
    const { data: updated, error: updateError } = await supabase
      .from('business_users')
      .update(updates)
      .eq('id', member_id)
      .eq('business_id', business_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating team member:', updateError)
      return NextResponse.json(
        { error: 'Failed to update team member' },
        { status: 500 }
      )
    }

    // Fetch profile data
    const { data: updatedProfileData } = await supabase
      .from('profiles')
      .select('email, full_name, avatar_url')
      .eq('id', updated.user_id)
      .single()

    return NextResponse.json({
      data: {
        ...updated,
        email: updatedProfileData?.email || 'N/A',
        full_name: updatedProfileData?.full_name || 'Unknown User',
        avatar_url: updatedProfileData?.avatar_url || null,
      },
      message: 'Team member updated successfully',
    })
  } catch (error: unknown) {
    console.error('Team PATCH error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update team member',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('member_id')
    const businessId = searchParams.get('business_id')

    if (!memberId || !businessId) {
      return NextResponse.json(
        { error: 'Missing required parameters: member_id and business_id' },
        { status: 400 }
      )
    }

    // Get user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify business access
    const { data: requesterUser } = await supabase
      .from('business_users')
      .select('id, role, is_active, permissions')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!requesterUser) {
      return NextResponse.json(
        { error: 'You do not have access to this business' },
        { status: 403 }
      )
    }

    // Check permissions
    const requesterPermissions = requesterUser.permissions as Record<string, boolean> | null
    const isOwner = requesterUser.role === 'owner'
    const canManageStaff = requesterPermissions?.manage_staff || false

    if (!isOwner && !canManageStaff) {
      return NextResponse.json(
        { error: 'You do not have permission to manage team members' },
        { status: 403 }
      )
    }

    // Get the member being deleted
    const { data: targetMember } = await supabase
      .from('business_users')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('business_id', businessId)
      .single()

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Prevent users from removing themselves
    if (targetMember.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 403 }
      )
    }

    // Only owners can remove other owners
    if (targetMember.role === 'owner' && !isOwner) {
      return NextResponse.json(
        { error: 'Only owners can remove other owners' },
        { status: 403 }
      )
    }

    // Soft delete by setting is_active to false (preferred over hard delete)
    const { error: deleteError } = await supabase
      .from('business_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('business_id', businessId)

    if (deleteError) {
      console.error('Error removing team member:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove team member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    })
  } catch (error: unknown) {
    console.error('Team DELETE error:', error)
    return NextResponse.json(
      {
        error: 'Failed to remove team member',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
