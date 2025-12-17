'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return // Already installed, don't show prompt
    }

    // Check if user already dismissed the prompt in this session
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      return
    }

    const handler = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault()

      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show our custom prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000) // Show after 2 seconds
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the browser's install prompt
    await deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice

    console.log(`User response to install prompt: ${outcome}`)

    // Clear the prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white rounded-lg shadow-2xl border border-stone-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
            <Download className="w-6 h-6 text-stone-700" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 mb-1">
              Install SideHusl
            </h3>
            <p className="text-sm text-stone-600 mb-3">
              Install our app for a better experience. Access it directly from your home screen!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
