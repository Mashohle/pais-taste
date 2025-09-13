import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single()

    if (businessError) {
      console.error('Failed to create business:', businessError)
      return NextResponse.json(
        { error: 'Failed to create business profile' },
        { status: 500 }
      )
    }

    // Create user account for business owner
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: application.owner_email,
      password: Math.random().toString(36).slice(-12), // Temporary password
      email_confirm: true,
      user_metadata: {
        first_name: application.owner_first_name,
        last_name: application.owner_last_name,
        phone: application.owner_phone,
        id_number: application.owner_id_number
      }
    })

    if (authError) {
      console.error('Failed to create user account:', authError)
      // Don't fail the whole process if user creation fails
      // They can create account later using the email
    }

    // Create business_user relationship
    if (authUser?.user) {
      const { error: businessUserError } = await supabase
        .from('business_users')
        .insert({
          business_id: business.id,
          user_id: authUser.user.id,
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
      }
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

    // TODO: Send welcome email to business owner
    // TODO: Send notification about new business to platform admin

    return NextResponse.json({
      message: 'Application approved successfully',
      business_id: business.id,
      user_created: !!authUser?.user
    })

  } catch (error) {
    console.error('Application approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}