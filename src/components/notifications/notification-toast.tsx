"use client"

import { useEffect, useState } from 'react'
import { X, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface NotificationData {
  title: string
  body: string
  url?: string
  icon?: string
}

interface NotificationToastProps {
  notification: NotificationData | null
  onClose: () => void
  onAction?: (url: string) => void
}

export function NotificationToast({ 
  notification, 
  onClose, 
  onAction 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setIsVisible(true)
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Allow animation to complete
  }

  const handleAction = () => {
    if (notification?.url && onAction) {
      onAction(notification.url)
    }
    handleClose()
  }

  if (!notification) return null

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </p>
            <p className="text-sm text-gray-600">
              {notification.body}
            </p>
            
            {notification.url && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="text-xs"
                >
                  View
                </Button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}