import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 API: Getting user session and profile')
    const supabase = await createClient()

    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ API: No authenticated user:', userError?.message)
      return NextResponse.json({
        user: null,
        profile: null,
        session: null,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Get session info
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.log('❌ API: No valid session:', sessionError?.message)
      return NextResponse.json({
        user: null,
        profile: null,
        session: null,
        error: 'Invalid session'
      }, { status: 401 })
    }

    console.log('✅ API: Valid session found for:', user.email)

    // Get user profile from database
    let profile = null
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('🏗️ API: Profile not found, creating new profile')
          profile = await createProfile(supabase, user)
        } else {
          console.error('🔍 API: Profile fetch error:', profileError)
          throw profileError
        }
      } else {
        console.log('✅ API: Profile found:', { role_id: profileData.role_id, email: profileData.email })

        // Check if super admin needs role correction
        const isSuperAdminEmail = profileData.email === '414hustlerz@gmail.com' ||
                                  profileData.email === 'superadmin@sidehusl.com'

        if (isSuperAdminEmail && profileData.role_id !== 'super-admin') {
          console.log('🔧 API: Correcting super admin role')
          const { data: updatedData, error: updateError } = await supabase
            .from('profiles')
            .update({ role_id: 'super-admin' })
            .eq('id', user.id)
            .select()
            .single()

          profile = updateError ? { ...profileData, role_id: 'super-admin' } : updatedData
        } else {
          profile = profileData
        }
      }
    } catch (error) {
      console.error('🔍 API: Error handling profile:', error)
      // Create fallback profile if database issues
      profile = createFallbackProfile(user)
    }

    return NextResponse.json({
      user,
      session,
      profile,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Unexpected error:', error)
    return NextResponse.json({
      user: null,
      profile: null,
      session: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function createProfile(supabase: any, user: any) {
  console.log('🏗️ API: Creating new profile for:', user.email)

  const isSuperAdminEmail = user.email === '414hustlerz@gmail.com' ||
                            user.email === 'superadmin@sidehusl.com'
  const defaultRole = isSuperAdminEmail ? 'super-admin' : 'customer'

  const newProfile = {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    phone: user.user_metadata?.phone || '',
    role_id: defaultRole,
    preferred_pickup_location: '',
    avatar_url: null,
    date_of_birth: null,
    address: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    dietary_preferences: null,
    allergies: null,
    marketing_emails: true,
    sms_notifications: true,
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (error) {
      console.log('🏗️ API: Database profile creation failed, using fallback')
      return createFallbackProfile(user)
    }

    console.log('✅ API: Profile created successfully:', { role_id: data.role_id })
    return data
  } catch (err) {
    console.log('🏗️ API: Profile creation error, using fallback')
    return createFallbackProfile(user)
  }
}

function createFallbackProfile(user: any) {
  const isSuperAdminEmail = user.email === '414hustlerz@gmail.com' ||
                            user.email === 'superadmin@sidehusl.com'
  const defaultRole = isSuperAdminEmail ? 'super-admin' : 'customer'

  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    phone: user.user_metadata?.phone || '',
    role_id: defaultRole,
    preferred_pickup_location: '',
    avatar_url: null,
    date_of_birth: null,
    address: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    dietary_preferences: null,
    allergies: null,
    marketing_emails: true,
    sms_notifications: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function PATCH(request: Request) {
  try {
    console.log('🔄 API: Updating user profile')
    const supabase = await createClient()

    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ API: No authenticated user:', userError?.message)
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    console.log('✅ API: Valid user found for profile update:', user.email)

    // Parse the request body
    const updates = await request.json()

    // Remove fields that shouldn't be updated via this endpoint
    const { id, email, role_id, created_at, ...allowedUpdates } = updates

    // Add updated timestamp
    const profileUpdates = {
      ...allowedUpdates,
      updated_at: new Date().toISOString()
    }

    console.log('🔄 API: Updating profile with:', Object.keys(profileUpdates))

    // Update the profile in database
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('💥 API: Profile update failed:', updateError)
      return NextResponse.json({
        error: 'Failed to update profile',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('✅ API: Profile updated successfully')

    return NextResponse.json({
      profile: data,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Unexpected error updating profile:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}