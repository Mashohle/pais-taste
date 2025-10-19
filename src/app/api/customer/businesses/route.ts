import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const userLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null

    const supabase = await createClient()

    // Build the query for active businesses only - only public fields
    let query = supabase
      .from('businesses')
      .select(`
        id,
        name,
        description,
        slug,
        address_line1,
        city,
        phone,
        website,
        logo_url,
        primary_color,
        latitude,
        longitude,
        business_categories (
          id,
          name,
          icon,
          color
        ),
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply category filter by category_id
    if (category) {
      query = query.eq('category_id', category)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: businesses, error } = await query

    if (error) {
      console.error('❌ Customer API: Error fetching businesses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch businesses' },
        { status: 500 }
      )
    }

    // Transform the data for customer portal consumption (public fields only)
    const transformedBusinesses = businesses?.map(business => {
      const categoryData = Array.isArray(business.business_categories)
        ? business.business_categories[0]
        : business.business_categories

      // Calculate distance if user coordinates are provided and business has coordinates
      let distance = null
      if (userLat && userLon && business.latitude && business.longitude) {
        distance = calculateDistance(userLat, userLon, business.latitude, business.longitude)
      }

      return {
        id: business.id,
        name: business.name,
        description: business.description,
        slug: business.slug,
        address: business.address_line1,
        city: business.city,
        phone: business.phone,
        website: business.website,
        logo_url: business.logo_url,
        primary_color: business.primary_color,
        category: {
          id: categoryData?.id || 'general',
          name: categoryData?.name || 'General',
          icon: categoryData?.icon || 'building',
          color: categoryData?.color || 'bg-gray-100 text-gray-700'
        },
        // Default values since rating/review columns don't exist yet
        rating: 4.5,
        review_count: 0,
        is_featured: false,
        distance,
        created_at: business.created_at
      }
    }) || []

    console.log(`✅ Customer API: Found ${transformedBusinesses.length} businesses${category ? ` in category ${category}` : ''}`)

    return NextResponse.json({
      businesses: transformedBusinesses,
      total: transformedBusinesses.length,
      offset,
      limit,
      filters: {
        category,
        search
      }
    })

  } catch (error) {
    console.error('💥 Customer API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}