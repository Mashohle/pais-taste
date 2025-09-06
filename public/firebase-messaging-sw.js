// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyBxHcaFKOzgV8-TGmJWb8v4r5V1VBGnAk4",
  authDomain: "pais-taste.firebaseapp.com",
  projectId: "pais-taste",
  storageBucket: "pais-taste.firebasestorage.app",
  messagingSenderId: "525997717992",
  appId: "1:525997717992:web:562c39e74b9e3da2c7cc5d",
  measurementId: "G-WRM81KJFY6"
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload)
  
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg', // Your app icon
    badge: '/logo.svg',
    data: {
      url: payload.data?.url || '/account/orders' // Default to orders page
    }
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  const targetUrl = event.notification.data?.url || '/account/orders'
  
  event.waitUntil(
    clients.matchAll().then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})