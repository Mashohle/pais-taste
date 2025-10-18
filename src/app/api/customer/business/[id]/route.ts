import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper functions for business status calculation
function calculateBusinessStatus(operatingHours: any): boolean {
  if (!operatingHours) return true // Default to open if no hours set

  const now = new Date()
  const currentDay = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
  const currentTime = now.toTimeString().slice(0, 5)

  const todayHours = operatingHours[currentDay]
  if (!todayHours || todayHours.closed) {
    return false
  }

  return currentTime >= todayHours.open && currentTime <= todayHours.close
}

function getStatusText(operatingHours: any): string {
  if (!operatingHours) return 'Open'

  const now = new Date()
  const currentDay = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
  const currentTime = now.toTimeString().slice(0, 5)

  const todayHours = operatingHours[currentDay]
  if (!todayHours || todayHours.closed) {
    return 'Closed Today'
  }

  const isCurrentlyOpen = currentTime >= todayHours.open && currentTime <= todayHours.close
  if (isCurrentlyOpen) {
    return `Open until ${todayHours.close}`
  } else {
    return `Opens at ${todayHours.open}`
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if id looks like a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

    let query = supabase
      .from('businesses')
      .select(`
        id,
        name,
        description,
        slug,
        address_line1,
        address_line2,
        city,
        state,
        phone,
        website,
        email,
        logo_url,
        primary_color,
        settings,
        is_active,
        business_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .eq('is_active', true)

    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }

    const { data: business, error: businessError } = await query.single()

    if (businessError) {
      console.error('Business fetch error:', businessError)
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Fetch menu items for food businesses
    let menuItems = []
    const categoryData = Array.isArray(business.business_categories)
      ? business.business_categories[0]
      : business.business_categories

    if (categoryData?.id === 'food') {
      const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', business.id)
        .eq('published', true)
        .eq('available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      menuItems = items || []
    }

    // TODO: Fetch additional data like reviews, gallery
    // Return business with computed fields
    const businessData = {
      id: business.id,
      name: business.name,
      slug: business.slug || business.id,
      description: business.description || '',
      logo_url: business.logo_url,
      rating: 4.5, // TODO: Calculate from reviews
      review_count: 0, // TODO: Count from reviews table
      address: [
        business.address_line1,
        business.address_line2,
        business.city,
        business.state
      ].filter(Boolean).join(', '),
      city: business.city,
      province: business.state,
      phone: business.phone,
      website: business.website,
      email: business.email,
      is_open: calculateBusinessStatus(business.settings?.operating_hours),
      status_text: getStatusText(business.settings?.operating_hours),
      is_active: business.is_active,
      settings: business.settings,
      category: categoryData ? {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color
      } : null,
      // Computed fields
      hours: '9:00 AM - 10:00 PM', // TODO: Get from settings
      delivery_fee: business.settings?.food?.delivery_fee || 0,
      minimum_order: business.settings?.food?.minimum_order || 0,
      price_range: business.settings?.price_range || '$$',
      features: [
        ...(business.settings?.food?.features || []),
        ...(business.settings?.retail?.features || []),
        ...(business.settings?.service?.features || [])
      ].filter(Boolean),
      // Include menu items for food businesses
      menu_items: menuItems,
      // TODO: Add these fields when we implement them
      reviews: [],
      gallery: [],
      services: []
    }

    return NextResponse.json({
      success: true,
      data: businessData
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}