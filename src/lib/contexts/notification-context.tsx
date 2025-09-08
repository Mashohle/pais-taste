"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// import { onMessageListener } from '@/lib/firebase' // Firebase disabled
import { NotificationToast, NotificationData } from '@/components/notifications/notification-toast'

interface NotificationContextType {
  showNotification: (notification: NotificationData) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Firebase messaging disabled
    console.log('Firebase messaging is disabled - not listening for messages')
  }, [])

  const showNotification = (notification: NotificationData) => {
    setCurrentNotification(notification)
  }

  const handleNotificationClose = () => {
    setCurrentNotification(null)
  }

  const handleNotificationAction = (url: string) => {
    router.push(url)
    setCurrentNotification(null)
  }

  const value = {
    showNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToast
        notification={currentNotification}
        onClose={handleNotificationClose}
        onAction={handleNotificationAction}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}