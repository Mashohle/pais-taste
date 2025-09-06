import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendNotificationToToken, sendNotificationToMultipleTokens } from '@/lib/firebase-admin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      body, 
      userId, 
      userIds, 
      icon, 
      url = '/account/orders' 
    } = await request.json()
    
    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    // Check if request has admin authorization
    const authHeader = request.headers.get('authorization')
    const adminKey = request.headers.get('x-admin-key')
    
    if (!authHeader?.startsWith('Bearer ') && adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const notification = {
      title,
      body,
      icon: icon || '/logo.svg',
      data: { url }
    }

    if (userId) {
      // Send to a single user
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_token, notifications_enabled')
        .eq('id', userId)
        .single()

      if (!profile?.notification_token || !profile?.notifications_enabled) {
        return NextResponse.json(
          { error: 'User has no notification token or notifications disabled' },
          { status: 400 }
        )
      }

      const response = await sendNotificationToToken(
        profile.notification_token,
        notification
      )

      return NextResponse.json({ 
        success: true, 
        messageId: response,
        sentTo: 1 
      })

    } else if (userIds && Array.isArray(userIds)) {
      // Send to multiple users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('notification_token, notifications_enabled')
        .in('id', userIds)
        .eq('notifications_enabled', true)
        .not('notification_token', 'is', null)

      if (!profiles || profiles.length === 0) {
        return NextResponse.json(
          { error: 'No valid notification tokens found for users' },
          { status: 400 }
        )
      }

      const tokens = profiles
        .map(p => p.notification_token)
        .filter(token => token !== null)

      const response = await sendNotificationToMultipleTokens(tokens, notification)

      return NextResponse.json({ 
        success: true, 
        sentTo: response.successCount,
        failed: response.failureCount 
      })

    } else {
      // Send to all users with notifications enabled
      const { data: profiles } = await supabase
        .from('profiles')
        .select('notification_token')
        .eq('notifications_enabled', true)
        .not('notification_token', 'is', null)

      if (!profiles || profiles.length === 0) {
        return NextResponse.json(
          { error: 'No users with notification tokens found' },
          { status: 400 }
        )
      }

      const tokens = profiles
        .map(p => p.notification_token)
        .filter(token => token !== null)

      const response = await sendNotificationToMultipleTokens(tokens, notification)

      return NextResponse.json({ 
        success: true, 
        sentTo: response.successCount,
        failed: response.failureCount 
      })
    }

  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}