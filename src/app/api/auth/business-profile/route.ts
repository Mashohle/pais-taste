import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Combined endpoint that returns user profile AND their businesses in a single call
 * This is more efficient than making separate calls to /profile and /businesses
 */
export async function GET() {
  try {
    console.log('🔍 API: Getting business profile (combined)')
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

    console.log('✅ API: Valid session found for:', user.email)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('❌ API: Profile not found')
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ API: Profile found:', { role_id: profile.role_id, email: profile.email })

    // Check if user is a business user
    const isBusinessUser = profile.role_id === 'business-owner' || profile.role_id === 'business-admin'

    let businesses = []

    if (isBusinessUser) {
      console.log('🏢 API: User is business user, fetching businesses')

      // Get user's businesses with full details
      const { data: businessUsers, error: businessError } = await supabase
        .from('business_users')
        .select(`
          id,
          role,
          is_active,
          permissions,
          businesses!inner (
            id,
            name,
            slug,
            description,
            email,
            phone,
            website,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            currency,
            timezone,
            logo_url,
            primary_color,
            accent_color,
            is_active,
            settings,
            business_categories (
              id,
              name,
              icon,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (businessError) {
        console.error('❌ API: Error fetching businesses:', businessError)
        // Don't fail the entire request - just return empty businesses
        businesses = []
      } else {
        // Transform the data to match the expected format
        businesses = (businessUsers || []).map((bu: any) => ({
          id: bu.id,
          name: bu.businesses.name,
          slug: bu.businesses.slug,
          role: bu.role,
          is_active: bu.is_active,
          permissions: bu.permissions,
          business: {
            id: bu.businesses.id,
            name: bu.businesses.name,
            slug: bu.businesses.slug,
            description: bu.businesses.description,
            email: bu.businesses.email,
            phone: bu.businesses.phone,
            website: bu.businesses.website,
            address_line1: bu.businesses.address_line1,
            address_line2: bu.businesses.address_line2,
            city: bu.businesses.city,
            state: bu.businesses.state,
            postal_code: bu.businesses.postal_code,
            country: bu.businesses.country,
            currency: bu.businesses.currency,
            timezone: bu.businesses.timezone,
            logo_url: bu.businesses.logo_url,
            primary_color: bu.businesses.primary_color,
            accent_color: bu.businesses.accent_color,
            is_active: bu.businesses.is_active,
            settings: bu.businesses.settings,
            business_categories: bu.businesses.business_categories,
          },
        }))

        console.log('✅ API: Found', businesses.length, 'businesses for user')
      }
    } else {
      console.log('ℹ️ API: User is not a business user')
    }

    // Return combined response
    return NextResponse.json({
      user,
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role_id: profile.role_id,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      businesses,
      isBusinessUser,
    })
  } catch (error) {
    console.error('💥 API: Business profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
