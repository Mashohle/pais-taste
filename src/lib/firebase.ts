// lib/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging'
import { getAnalytics } from "firebase/analytics";

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBxHcaFKOzgV8-TGmJWb8v4r5V1VBGnAk4",
  authDomain: "pais-taste.firebaseapp.com",
  projectId: "pais-taste",
  storageBucket: "pais-taste.firebasestorage.app",
  messagingSenderId: "525997717992",
  appId: "1:525997717992:web:562c39e74b9e3da2c7cc5d",
  measurementId: "G-WRM81KJFY6"
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging: Messaging | null = typeof window !== 'undefined' ? getMessaging(app) : null

// Register service worker explicitly
export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null
  
  try {
    // Check if push notifications are supported
    if (!('PushManager' in window)) {
      console.error('Push messaging is not supported')
      return null
    }

    // Register service worker first
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      })
      console.log('Service worker registered:', registration)
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready
      
      // Initialize messaging with the registered service worker
      const messaging = getMessaging(app)
      return messaging
    }
    return null
  } catch (error) {
    console.error('Error registering service worker:', error)
    return null
  }
}

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Request permission and get token
export const requestForToken = async (): Promise<string | null> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications')
      return null
    }

    // Check current permission
    let permission = Notification.permission
    
    // Request permission if not already granted
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }
    
    if (permission !== 'granted') {
      console.error('Notification permission denied:', permission)
      return null
    }

    // Initialize messaging with proper service worker registration
    const messagingInstance = await initializeMessaging()
    if (!messagingInstance) {
      console.error('Messaging not available')
      return null
    }

    // Check if VAPID key is available
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      console.error('VAPID key not found in environment variables')
      return null
    }
    
    const currentToken = await getToken(messagingInstance, { 
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    })
    
    if (currentToken) {
      console.log('Registration token:', currentToken)
      return currentToken
    } else {
      console.log('No registration token available. May need to request permission.')
      return null
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err)
    return null
  }
}

// Listen for foreground messages
export const onMessageListener = (): Promise<MessagePayload> =>
  new Promise(async (resolve, reject) => {
    try {
      const messagingInstance = await initializeMessaging()
      if (!messagingInstance) {
        reject(new Error('Messaging not available'))
        return
      }
      
      onMessage(messagingInstance, (payload: MessagePayload) => {
        console.log('Received foreground message ', payload)
        resolve(payload)
      })
    } catch (error) {
      reject(error)
    }
  })