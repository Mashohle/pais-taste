import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (!provider || !['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Valid provider (google/facebook) is required' },
        { status: 400 }
      )
    }

    console.log('🔐 API: Initiating OAuth for provider:', provider)
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
      }
    })

    if (error) {
      console.log('❌ API: OAuth initiation failed:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('✅ API: OAuth URL generated for:', provider)
    return NextResponse.json({
      redirectUrl: data.url,
      error: null
    })

  } catch (error) {
    console.error('💥 API: OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}