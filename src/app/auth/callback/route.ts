import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      // Check if this is a password recovery flow
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // If we have a recovery token, redirect to reset password page
        const isRecovery = requestUrl.searchParams.get('type') === 'recovery'

        if (isRecovery) {
          return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
        }
      }

      // For normal sign-in, redirect to the next URL or home
      return NextResponse.redirect(`${requestUrl.origin}${next}`)

    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_failed`)
    }
  }

  // If no code provided, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
