# Firebase Push Notifications Implementation

This implementation provides complete Firebase push notifications for your food ordering app.

## 🚀 Features

- ✅ Browser push notifications (foreground & background)
- ✅ User notification preferences
- ✅ Notification token management
- ✅ Admin API for sending notifications
- ✅ Real-time toast notifications
- ✅ Service worker for background notifications

## 📋 Setup Requirements

### 1. Environment Variables
Add these to your `.env.local`:

```bash
# Firebase Admin SDK (for sending notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Optional: Admin API protection
ADMIN_API_KEY=your_secret_admin_key

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Schema Updates
Add these columns to your `profiles` table:

```sql
ALTER TABLE profiles 
ADD COLUMN notification_token TEXT,
ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;
```

### 3. Firebase Console Setup
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Generate a Web Push certificate (VAPID key)
3. Update the `vapidKey` in `/src/lib/firebase.ts` (currently placeholder)
4. Download your service account key and add credentials to environment variables

## 🎯 How to Use

### For Users
1. Navigate to `/account/settings`
2. Enable push notifications in the "Notification Settings" section
3. Allow browser permissions when prompted

### For Developers - Sending Notifications

#### Send to Single User
```javascript
POST /api/notifications/send
Headers: 
  - Authorization: Bearer <admin_token>
  - OR x-admin-key: <ADMIN_API_KEY>

Body:
{
  "title": "Order Ready!",
  "body": "Your order #123 is ready for pickup",
  "userId": "user-uuid",
  "url": "/account/orders/123"
}
```

#### Send to Multiple Users
```javascript
POST /api/notifications/send
Body:
{
  "title": "New Menu Items!",
  "body": "Check out our latest additions",
  "userIds": ["user1-uuid", "user2-uuid"],
  "url": "/menu"
}
```

#### Broadcast to All Users
```javascript
POST /api/notifications/send
Body:
{
  "title": "Special Offer!",
  "body": "20% off all orders today only",
  "url": "/menu"
}
```

## 📁 File Structure

```
src/
├── lib/
│   ├── firebase.ts              # Client-side Firebase config
│   ├── firebase-admin.ts        # Server-side Firebase Admin
│   └── contexts/
│       └── notification-context.tsx  # Foreground notifications
├── components/notifications/
│   ├── push-notifications.tsx   # Permission component
│   └── notification-toast.tsx   # Toast notification UI
├── app/api/
│   ├── user/notification-token/ # Save user tokens
│   └── notifications/send/      # Send notifications
└── public/
    └── firebase-messaging-sw.js # Service worker
```

## 🔧 Integration Examples

### Order Status Updates
```javascript
// When order status changes
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.ADMIN_API_KEY
  },
  body: JSON.stringify({
    title: 'Order Update',
    body: `Your order is now ${newStatus}`,
    userId: order.user_id,
    url: `/account/orders/${order.id}`
  })
})
```

### Marketing Notifications
```javascript
// Send promotional notifications
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.ADMIN_API_KEY
  },
  body: JSON.stringify({
    title: 'Weekend Special!',
    body: 'Get 15% off all traditional dishes',
    url: '/menu'
  })
})
```

## 🎨 Customization

### Notification Appearance
- Update icons in `public/` directory
- Modify toast styles in `notification-toast.tsx`
- Customize service worker behavior in `firebase-messaging-sw.js`

### Permission Flow
- The `PushNotifications` component handles user permissions
- Notifications are automatically enabled for new users
- Users can disable notifications in settings

## 🔍 Testing

1. **Development Testing:**
   - Use browser dev tools → Application → Service Workers
   - Check console for registration messages
   - Test with Firebase Console's "Send test message"

2. **Production Testing:**
   - Ensure HTTPS (required for service workers)
   - Test on different devices and browsers
   - Verify notifications work when app is closed

## 🚨 Important Notes

- ⚠️ Replace placeholder VAPID key in `firebase.ts`
- ⚠️ Service workers require HTTPS in production
- ⚠️ Users must grant permission for notifications to work
- ⚠️ Tokens can expire - implement refresh logic if needed

## 📊 Monitoring

Check notification success rates in:
- Firebase Console → Cloud Messaging
- Your application logs
- API response data (success/failure counts)

---

**Ready to use!** Users can now receive real-time notifications about their orders, promotions, and app updates.