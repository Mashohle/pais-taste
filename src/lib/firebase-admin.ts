import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

// Initialize Firebase Admin SDK lazily to avoid build-time errors
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // Only initialize if environment variables are present
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials are not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.')
    }

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getApps()[0]
}

// Lazy getter for messaging instance
let messagingInstance: ReturnType<typeof getMessaging> | null = null
const getMessagingInstance = () => {
  if (!messagingInstance) {
    const app = initializeFirebaseAdmin()
    messagingInstance = getMessaging(app)
  }
  return messagingInstance
}

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

    const messaging = getMessagingInstance()
    // @ts-expect-error - Firebase webpush config type mismatch
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

    const messaging = getMessagingInstance()
    // @ts-expect-error - Firebase sendMulticast method type issue
    const response = await messaging.sendMulticast(message)
    console.log('Successfully sent messages:', response)

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp: { success: boolean }, idx: number) => {
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