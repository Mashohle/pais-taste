import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Use service role to bypass RLS policies
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: businesses, error } = await adminSupabase
      .from('businesses')
      .select(`
        *,
        business_users(
          user_id,
          role,
          is_active
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching businesses:', error)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }

    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Businesses API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}