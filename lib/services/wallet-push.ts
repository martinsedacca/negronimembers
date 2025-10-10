import apn from 'apn'

// Configure APNs connection
let apnProvider: apn.Provider | null = null

function getApnProvider(): apn.Provider {
  if (apnProvider) return apnProvider

  const options: apn.ProviderOptions = {
    token: {
      key: process.env.APPLE_WALLET_PUSH_KEY || '',
      keyId: process.env.APPLE_WALLET_KEY_ID || '',
      teamId: process.env.APPLE_TEAM_ID || '',
    },
    production: process.env.NODE_ENV === 'production',
  }

  apnProvider = new apn.Provider(options)
  return apnProvider
}

export interface WalletPushNotification {
  message?: string
  title?: string
}

/**
 * Send push notification to Apple Wallet
 * This will trigger the wallet to update the pass
 */
export async function sendWalletPushNotification(
  pushToken: string,
  notification?: WalletPushNotification
): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = getApnProvider()

    // Create notification
    const apnNotification = new apn.Notification()
    
    // For Wallet passes, we typically send an empty notification
    // This tells the device to fetch the updated pass from our server
    apnNotification.expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour
    apnNotification.priority = 10
    apnNotification.topic = process.env.APPLE_WALLET_PASS_TYPE_ID || ''

    // Optional: Add alert if you want a visible notification
    if (notification?.message) {
      apnNotification.alert = {
        title: notification.title || 'Actualización',
        body: notification.message,
      }
      apnNotification.sound = 'default'
    }

    // Send notification
    const result = await provider.send(apnNotification, pushToken)

    // Check for errors
    if (result.failed && result.failed.length > 0) {
      const failure = result.failed[0]
      console.error('🔴 [Wallet Push] Failed:', failure.response)
      
      return {
        success: false,
        error: failure.response?.reason || 'Unknown APNs error',
      }
    }

    console.log('✅ [Wallet Push] Sent successfully to:', pushToken.substring(0, 20) + '...')
    return { success: true }
  } catch (error: any) {
    console.error('🔴 [Wallet Push] Exception:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send push notification to multiple devices
 */
export async function sendBulkWalletPushNotifications(
  pushTokens: string[],
  notification?: WalletPushNotification
): Promise<{
  total: number
  sent: number
  failed: number
  errors: Array<{ token: string; error: string }>
}> {
  const results = await Promise.allSettled(
    pushTokens.map(token => sendWalletPushNotification(token, notification))
  )

  const errors: Array<{ token: string; error: string }> = []
  let sent = 0
  let failed = 0

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++
    } else {
      failed++
      const token = pushTokens[index]
      const error = result.status === 'fulfilled' 
        ? result.value.error || 'Unknown error'
        : 'Promise rejected'
      errors.push({ token: token.substring(0, 20) + '...', error })
    }
  })

  return {
    total: pushTokens.length,
    sent,
    failed,
    errors,
  }
}

/**
 * Shutdown APNs provider gracefully
 */
export function shutdownWalletPush() {
  if (apnProvider) {
    apnProvider.shutdown()
    apnProvider = null
  }
}
