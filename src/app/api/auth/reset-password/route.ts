import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('🔐 API: Sending password reset to:', email)
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.log('❌ API: Password reset failed:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('✅ API: Password reset sent to:', email)
    return NextResponse.json({
      success: true,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}