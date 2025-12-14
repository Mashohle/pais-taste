import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { approval_notes } = await request.json()

    // Get current user (super-admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Auth check - User:', user?.email, 'Error:', userError)
    
    if (userError || !user) {
      console.log('Authentication failed:', userError?.message)
      return NextResponse.json(
        { error: `Unauthorized: ${userError?.message || 'No user found'}` },
        { status: 401 }
      )
    }

    // Verify user has super admin permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role_id !== 'super-admin') {
      console.log('Permission check failed:', profileError?.message, 'Role:', profile?.role_id)
      return NextResponse.json(
        { error: 'Insufficient permissions - Super admin access required' },
        { status: 403 }
      )
    }

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from('business_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      )
    }

    // Use service_role key for admin operations to bypass RLS
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: () => '',
          set: () => {},
          remove: () => {},
        },
      }
    )

    // Start transaction by creating the business first
    const businessData = {
      name: application.business_name,
      slug: application.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      description: application.description,
      category_id: application.business_category,

      email: application.owner_email,
      phone: application.owner_phone,

      address_line1: application.street_address,
      address_line2: application.suburb,
      city: application.city,
      state: application.province,
      postal_code: application.postal_code,
      country: 'South Africa',

      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',

      is_active: true,
      is_verified: true,
      setup_completed: false,

      settings: {
        operating_hours: application.operating_hours
      }
    }

    const { data: business, error: businessError } = await adminSupabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single()

    if (businessError) {
      console.error('Failed to create business:', businessError)
      console.error('Business data attempted:', businessData)
      return NextResponse.json(
        { error: `Failed to create business profile: ${businessError.message}` },
        { status: 500 }
      )
    }

    // Try to create user account, or find existing user
    let userId = null
    let isNewUser = false
    const temporaryPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!@#'

    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: application.owner_email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: application.owner_first_name,
        last_name: application.owner_last_name,
        phone: application.owner_phone,
        id_number: application.owner_id_number,
        role_id: 'business-owner'
      }
    })

    if (authError) {
      console.error('Failed to create user account:', authError)

      // If user already exists, try to find them
      if (authError.message?.includes('already been registered')) {
        const { data: existingUsers, error: listError } = await adminSupabase.auth.admin.listUsers()
        if (!listError && existingUsers) {
          const existingUser = existingUsers.users.find(u => u.email === application.owner_email)
          if (existingUser) {
            userId = existingUser.id
            console.log('Found existing user:', existingUser.email)
          }
        }
      }
    } else if (authUser?.user) {
      userId = authUser.user.id
      isNewUser = true
      console.log('Created new user:', authUser.user.email)
    }

    // Create or update user profile with business-owner role
    if (userId) {
      const profileData = {
        id: userId,
        email: application.owner_email,
        full_name: `${application.owner_first_name} ${application.owner_last_name}`,
        phone: application.owner_phone,
        role_id: 'business-owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (profileError) {
        console.error('Failed to create/update profile:', profileError)
      } else {
        console.log('Successfully created/updated profile for business owner:', userId)
      }

      // Create business_user relationship using admin client to bypass RLS
      const { error: businessUserError } = await adminSupabase
        .from('business_users')
        .insert({
          business_id: business.id,
          user_id: userId,
          role: 'owner',
          permissions: {
            manage_menu: true,
            manage_inventory: true,
            view_orders: true,
            manage_orders: true,
            process_payments: true,
            manage_staff: true,
            view_staff_schedule: true,
            view_customers: true,
            manage_customers: true,
            view_analytics: true,
            export_data: true,
            manage_settings: true,
            manage_integrations: true,
            manage_appointments: true,
            manage_services: true
          },
          is_active: true
        })

      if (businessUserError) {
        console.error('Failed to create business user relationship:', businessUserError)
      } else {
        console.log('Successfully created business user relationship for user:', userId)
      }
    } else {
      console.error('Could not determine user ID for business owner')
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('business_applications')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        approval_notes,
        business_id: business.id
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update application:', updateError)
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      )
    }

    // Send email to business owner
    let emailSent = false

    if (userId) {
      try {
        if (isNewUser) {
          // NEW users: Send Invite email (uses Supabase's "Invite User" template)
          // This takes them to password setup page
          const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
            application.owner_email,
            {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/set-password`
            }
          )

          if (inviteError) {
            console.error('❌ Failed to send invite email:', inviteError)
          } else {
            console.log('✅ Invite email sent to NEW user:', application.owner_email)
            console.log('   → Will redirect to: /auth/set-password')
            emailSent = true
          }
        } else {
          // EXISTING users: Send Magic Link email (uses Supabase's "Magic Link" template)
          // This takes them directly to admin portal
          const { error: magicLinkError } = await adminSupabase.auth.signInWithOtp({
            email: application.owner_email,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/admin`
            }
          })

          if (magicLinkError) {
            console.error('❌ Failed to send magic link email:', magicLinkError)
          } else {
            console.log('✅ Magic link sent to EXISTING user:', application.owner_email)
            console.log('   → Will redirect to: /admin')
            emailSent = true
          }
        }
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError)
        // Don't fail the approval if email fails
      }
    }

    return NextResponse.json({
      message: 'Application approved successfully',
      business_id: business.id,
      user_created: isNewUser,
      user_found: !!userId,
      business_user_created: !!userId,
      email_sent: emailSent
    })

  } catch (error) {
    console.error('Application approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}