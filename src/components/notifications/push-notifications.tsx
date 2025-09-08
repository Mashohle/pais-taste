"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
// import { requestForToken, onMessageListener } from '@/lib/firebase' // Firebase disabled
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'

type NotificationPermission = 'default' | 'granted' | 'denied'

export function PushNotifications() {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window)
    setPermission(Notification.permission as NotificationPermission)
  }, [])

  useEffect(() => {
    // Firebase messaging disabled
    console.log('Firebase messaging is disabled - not requesting token')
  }, [permission, user])

  useEffect(() => {
    // Firebase messaging disabled
    console.log('Firebase messaging is disabled - not listening for messages')
  }, [permission])

  const requestPermission = async () => {
    console.log('Firebase messaging is disabled - notification requests disabled')
    alert('Push notifications are temporarily disabled.')
  }

  const saveTokenToDatabase = async (token: string): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No session found')
      }

      const response = await fetch('/api/user/notification-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error('Failed to save token')
      }
    } catch (error: unknown) {
      console.error('Error saving token:', error)
      throw error
    }
  }

  if (!isSupported || !user) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      {permission === 'granted' ? (
        <div className="flex items-center text-green-600 text-sm">
          <Bell className="w-4 h-4 mr-1" />
          <span>Notifications enabled</span>
        </div>
      ) : (
        <Button
          onClick={requestPermission}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <BellOff className="w-4 h-4" />
          Enable Notifications
        </Button>
      )}
    </div>
  )
}