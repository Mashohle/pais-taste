import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const menuItemId = formData.get('menuItemId') as string
    const businessId = formData.get('businessId') as string

    if (!file || !menuItemId || !businessId) {
      return NextResponse.json({ error: 'File, menu item ID, and business ID are required' }, { status: 400 })
    }

    // Verify user has access to this business
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!businessUser || !['owner', 'admin', 'staff'].includes(businessUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify menu item belongs to this business
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', menuItemId)
      .eq('business_id', businessId)
      .single()

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${menuItemId}-${Date.now()}.${fileExt}`
    const filePath = `menu-items/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      path: filePath
    })
  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl, businessId } = await request.json()

    if (!imageUrl || !businessId) {
      return NextResponse.json({ error: 'Image URL and business ID are required' }, { status: 400 })
    }

    // Verify user has access to this business
    const { data: businessUser } = await supabase
      .from('business_users')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!businessUser || !['owner', 'admin', 'staff'].includes(businessUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/menu-images/')
    if (urlParts.length !== 2) {
      return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 })
    }

    const filePath = urlParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from('menu-images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Image deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}