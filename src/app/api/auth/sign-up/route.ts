import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone } = await request.json()

    if (!email || !password || !full_name || !phone) {
      return NextResponse.json(
        { error: 'Email, password, full name, and phone are required' },
        { status: 400 }
      )
    }

    console.log('🔐 API: Attempting sign up for:', email)
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone
        }
      }
    })

    if (error) {
      console.log('❌ API: Sign up failed:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('✅ API: Sign up successful for:', email)
    return NextResponse.json({
      user: data.user,
      session: data.session,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}