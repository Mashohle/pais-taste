// lib/firebase.ts
// Firebase temporarily disabled
/*
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
  authDomain: "sidehusl.firebaseapp.com",
  projectId: "sidehusl",
  storageBucket: "sidehusl.firebasestorage.app",
  messagingSenderId: "525997717992",
  appId: "1:525997717992:web:562c39e74b9e3da2c7cc5d",
  measurementId: "G-WRM81KJFY6"
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)
*/

// Firebase messaging disabled - returning null/empty functions
export const messaging: null = null

export const initializeMessaging = async (): Promise<null> => {
  console.log('Firebase messaging is disabled')
  return null
}

export const analytics = null

export const requestForToken = async (): Promise<null> => {
  console.log('Firebase messaging is disabled')
  return null
}

export const onMessageListener = (): Promise<never> => {
  return new Promise((_, reject) => {
    reject(new Error('Firebase messaging is disabled'))
  })
}