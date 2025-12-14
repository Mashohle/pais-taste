import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 [SuperAdmin API]: Getting user session and profile')
    const supabase = await createClient()

    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ [SuperAdmin API]: No authenticated user:', userError?.message)
      return NextResponse.json({
        profile: null,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    console.log('✅ [SuperAdmin API]: Valid session found for:', user.email)

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role_id, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ [SuperAdmin API]: Profile fetch error:', profileError)
      return NextResponse.json({
        profile: null,
        error: 'Profile not found'
      }, { status: 404 })
    }

    // Verify user is super admin
    if (profile.role_id !== 'super-admin') {
      console.log('❌ [SuperAdmin API]: User is not a super admin:', profile.role_id)
      return NextResponse.json({
        profile: null,
        error: 'Access denied: Super admin permissions required'
      }, { status: 403 })
    }

    console.log('✅ [SuperAdmin API]: Super admin profile found')

    // Return profile with mapped field names
    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role_id, // Map role_id to role
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      error: null
    })

  } catch (error: unknown) {
    console.error('💥 [SuperAdmin API]: Unexpected error:', error)
    return NextResponse.json({
      profile: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
