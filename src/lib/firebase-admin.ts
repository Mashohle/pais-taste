import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getApps()[0]
}

const app = initializeFirebaseAdmin()
export const messaging = getMessaging(app)

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, string>
}

export const sendNotificationToToken = async (
  token: string,
  notification: NotificationPayload
) => {
  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/logo.svg',
      },
      data: notification.data || {},
      webpush: {
        fcm_options: {
          link: notification.data?.url || '/account/orders',
        },
      },
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
    return response
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export const sendNotificationToMultipleTokens = async (
  tokens: string[],
  notification: NotificationPayload
) => {
  try {
    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/logo.svg',
      },
      data: notification.data || {},
      webpush: {
        fcm_options: {
          link: notification.data?.url || '/account/orders',
        },
      },
    }

    const response = await messaging.sendMulticast(message)
    console.log('Successfully sent messages:', response)
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx])
        }
      })
      console.log('Failed tokens:', failedTokens)
    }
    
    return response
  } catch (error) {
    console.error('Error sending messages:', error)
    throw error
  }
}