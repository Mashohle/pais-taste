import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const applicationData = await request.json()

    // Validate required fields
    const requiredFields = [
      'business_name',
      'business_category', 
      'owner_first_name',
      'owner_last_name',
      'owner_email'
    ]

    for (const field of requiredFields) {
      if (!applicationData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate terms agreement
    if (!applicationData.agree_to_terms || !applicationData.agree_to_commission) {
      return NextResponse.json(
        { error: 'You must agree to the terms and commission structure' },
        { status: 400 }
      )
    }

    // Check if email already has a pending application
    const { data: existingApplication } = await supabase
      .from('business_applications')
      .select('id, status')
      .eq('owner_email', applicationData.owner_email)
      .eq('status', 'pending')
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending application. Please wait for review.' },
        { status: 400 }
      )
    }

    // Insert the application
    const { data: application, error } = await supabase
      .from('business_applications')
      .insert({
        business_name: applicationData.business_name,
        business_category: applicationData.business_category,
        business_type: applicationData.business_type || null,
        description: applicationData.description || null,
        
        owner_first_name: applicationData.owner_first_name,
        owner_last_name: applicationData.owner_last_name,
        owner_email: applicationData.owner_email,
        owner_phone: applicationData.owner_phone || null,
        owner_id_number: applicationData.owner_id_number || null,
        
        street_address: applicationData.street_address || null,
        suburb: applicationData.suburb || null,
        city: applicationData.city || null,
        province: applicationData.province || null,
        postal_code: applicationData.postal_code || null,
        
        registration_number: applicationData.registration_number || null,
        tax_number: applicationData.tax_number || null,
        bank_name: applicationData.bank_name || null,
        account_number: applicationData.account_number || null,
        branch_code: applicationData.branch_code || null,
        
        operating_hours: applicationData.operating_hours || {},
        documents: applicationData.documents || [],
        
        agree_to_terms: applicationData.agree_to_terms,
        agree_to_commission: applicationData.agree_to_commission,
        
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email to applicant
    // TODO: Send notification to super-admin

    return NextResponse.json({
      id: application.id,
      status: 'pending',
      message: 'Application submitted successfully'
    })

  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase
      .from('business_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json(applications)

  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}