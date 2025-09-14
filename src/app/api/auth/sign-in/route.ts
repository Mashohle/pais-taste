import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔐 API: Attempting sign in for:', email)
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log('❌ API: Sign in failed:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      console.log('❌ API: Sign in failed - no user/session')
      return NextResponse.json(
        { error: 'Sign in failed' },
        { status: 401 }
      )
    }

    console.log('✅ API: Sign in successful for:', data.user.email)

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role_id, full_name')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.log('❌ API: Profile fetch failed:', profileError.message)
      return NextResponse.json({
        user: data.user,
        session: data.session,
        profile: null,
        error: null
      })
    }

    console.log('✅ API: Profile fetched for sign in:', profile?.role_id)
    return NextResponse.json({
      user: data.user,
      session: data.session,
      profile: profile,
      error: null
    })

  } catch (error) {
    console.error('💥 API: Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}