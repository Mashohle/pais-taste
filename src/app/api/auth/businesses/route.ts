import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🏢 API: Getting user businesses')
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ API: No authenticated user for businesses')
      return NextResponse.json({ businesses: [], error: 'Not authenticated' }, { status: 401 })
    }

    console.log('✅ API: Fetching businesses for user:', user.email)

    // Get user's business access
    const { data: businessUsers, error: businessError } = await supabase
      .from('business_users')
      .select(`
        *,
        businesses (
          *,
          business_categories (
            id,
            name,
            description,
            icon,
            color
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (businessError) {
      console.log('🏢 API: No business access for user (expected for regular customers):', businessError.message)
      return NextResponse.json({ businesses: [] })
    }

    // Transform the data to match expected format
    const businesses = businessUsers?.map(bu => ({
      id: bu.businesses.id,
      name: bu.businesses.name,
      slug: bu.businesses.slug,
      role: bu.role,
      is_active: bu.is_active,
      permissions: bu.permissions,
      business: bu.businesses
    })) || []

    console.log('✅ API: Found', businesses.length, 'businesses for user')

    return NextResponse.json({ businesses })

  } catch (error) {
    console.error('💥 API: Error fetching businesses:', error)
    return NextResponse.json({ businesses: [], error: 'Internal server error' }, { status: 500 })
  }
}