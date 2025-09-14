import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    console.log('📸 API: Uploading avatar')
    const supabase = await createClient()

    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ API: No authenticated user:', userError?.message)
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    console.log('✅ API: Valid user found for avatar upload:', user.email)

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({
        error: 'No file provided'
      }, { status: 400 })
    }

    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    console.log('📸 API: Uploading file:', filePath)

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('💥 API: Avatar upload failed:', uploadError)
      return NextResponse.json({
        error: 'Failed to upload avatar',
        details: uploadError.message
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    console.log('📸 API: Avatar uploaded, updating profile')

    // Update profile with new avatar URL
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('💥 API: Profile update failed:', updateError)
      // Try to clean up uploaded file
      await supabase.storage.from('profile-images').remove([filePath])
      return NextResponse.json({
        error: 'Failed to update profile with avatar',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('✅ API: Avatar uploaded and profile updated')

    return NextResponse.json({
      avatar_url: publicUrl,
      profile: data,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Unexpected error uploading avatar:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    console.log('🗑️ API: Deleting avatar')
    const supabase = await createClient()

    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('❌ API: No authenticated user:', userError?.message)
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    console.log('✅ API: Valid user found for avatar deletion:', user.email)

    // Get current profile to find avatar URL
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        error: 'Profile not found'
      }, { status: 404 })
    }

    // Extract file path from URL if avatar exists
    if (profile.avatar_url) {
      const urlParts = profile.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`

      console.log('🗑️ API: Deleting file:', filePath)

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([filePath])

      if (deleteError) {
        console.warn('⚠️ API: Failed to delete avatar from storage:', deleteError)
        // Continue anyway to remove from profile
      }
    }

    // Update profile to remove avatar URL
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('💥 API: Profile update failed:', updateError)
      return NextResponse.json({
        error: 'Failed to update profile',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('✅ API: Avatar deleted and profile updated')

    return NextResponse.json({
      profile: data,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Unexpected error deleting avatar:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}