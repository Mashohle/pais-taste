import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get categories with cached business counts (only show categories with businesses)
    const { data: categories, error: categoriesError } = await supabase
      .from('business_categories')
      .select('*')
      .gt('business_count', 0)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      console.error('❌ Customer API: Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Transform for customer portal consumption
    const transformedCategories = categories?.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon || 'building',
      color: category.color || 'bg-gray-100 text-gray-700',
      description: category.description,
      count: category.business_count
    })) || []

    console.log(`✅ Customer API: Found ${transformedCategories.length} categories with businesses`)

    return NextResponse.json({
      categories: transformedCategories
    })

  } catch (error) {
    console.error('💥 Customer API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}