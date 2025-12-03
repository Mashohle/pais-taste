import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Update business information
 * PATCH /api/admin/business
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 API: Updating business information')
    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ API: Not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { businessId, updates } = body

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    console.log('📝 API: Business update request:', {
      businessId,
      userId: user.id,
      fields: Object.keys(updates)
    })

    // Verify user has permission to update this business
    const { data: businessUser, error: permissionError } = await supabase
      .from('business_users')
      .select('id, role, is_active')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (permissionError || !businessUser) {
      console.log('❌ API: User does not have access to this business')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user has admin or owner role
    const isAdmin = businessUser.role === 'admin' || businessUser.role === 'owner'
    if (!isAdmin) {
      console.log('❌ API: User does not have admin/owner permissions')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Owner-only fields
    const ownerOnlyFields = ['name', 'currency']
    const isOwner = businessUser.role === 'owner'

    // Filter out owner-only fields if user is not owner
    const allowedUpdates = { ...updates }
    if (!isOwner) {
      ownerOnlyFields.forEach(field => {
        if (field in allowedUpdates) {
          console.log(`⚠️ API: Removing owner-only field '${field}' for non-owner user`)
          delete allowedUpdates[field]
        }
      })
    }

    // Update the business
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ API: Error updating business:', updateError)
      return NextResponse.json(
        { error: 'Failed to update business', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ API: Business updated successfully:', {
      businessId,
      updatedFields: Object.keys(allowedUpdates)
    })

    return NextResponse.json({
      success: true,
      business: updatedBusiness
    })
  } catch (error: unknown) {
    console.error('💥 API: Business update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
