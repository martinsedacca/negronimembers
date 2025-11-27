import webpush from 'web-push'

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@membership.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  data?: any
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      url: payload.url,
      data: payload.data,
    })

    await webpush.sendNotification(subscription, notificationPayload, {
      TTL: 86400, // 24 hours
      urgency: 'high',
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Push notification error:', error)
    
    // Handle expired subscriptions
    if (error.statusCode === 410) {
      return { success: false, error: 'subscription_expired' }
    }
    
    return { success: false, error: error.message }
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{
  total: number
  sent: number
  failed: number
  errors: Array<{ endpoint: string; error: string }>
}> {
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification(sub, payload))
  )

  const errors: Array<{ endpoint: string; error: string }> = []
  let sent = 0
  let failed = 0

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++
    } else {
      failed++
      const endpoint = subscriptions[index].endpoint
      const error = result.status === 'fulfilled' 
        ? result.value.error || 'Unknown error'
        : 'Promise rejected'
      errors.push({ endpoint, error })
    }
  })

  return {
    total: subscriptions.length,
    sent,
    failed,
    errors,
  }
}
