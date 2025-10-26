import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for business data from Supabase
interface BusinessData {
  id: string
  name: string
  slug: string
  description: string | null
  email: string | null
  phone: string | null
  website: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  currency: string | null
  timezone: string | null
  logo_url: string | null
  primary_color: string | null
  accent_color: string | null
  is_active: boolean
  settings: Record<string, unknown> | null
  business_categories: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }[]
}

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

    let businesses: unknown[] = []

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
        // Supabase returns businesses as an array even with !inner join
        businesses = (businessUsers || []).map((bu: {
          id: string
          role: string
          is_active: boolean
          permissions: Record<string, unknown> | null
          businesses: BusinessData[]
        }) => {
          const business = bu.businesses[0] // Take first element from array
          const category = business?.business_categories?.[0] // Take first category from array

          return {
            id: bu.id,
            name: business?.name || '',
            slug: business?.slug || '',
            role: bu.role,
            is_active: bu.is_active,
            permissions: bu.permissions,
            business: {
              id: business?.id || '',
              name: business?.name || '',
              slug: business?.slug || '',
              description: business?.description || null,
              email: business?.email || null,
              phone: business?.phone || null,
              website: business?.website || null,
              address_line1: business?.address_line1 || null,
              address_line2: business?.address_line2 || null,
              city: business?.city || null,
              state: business?.state || null,
              postal_code: business?.postal_code || null,
              country: business?.country || null,
              currency: business?.currency || null,
              timezone: business?.timezone || null,
              logo_url: business?.logo_url || null,
              primary_color: business?.primary_color || null,
              accent_color: business?.accent_color || null,
              is_active: business?.is_active || false,
              settings: business?.settings || null,
              business_categories: category || null,
            },
          }
        })

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
  } catch (error: unknown) {
    console.error('💥 API: Business profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
