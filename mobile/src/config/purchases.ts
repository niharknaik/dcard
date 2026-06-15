import {Platform} from 'react-native';

/**
 * Centralized billing-provider selection for REAL-MONEY purchases
 * (subscriptions, template unlocks).
 *
 * Google Play requires that in-app purchases of digital goods go through Google
 * Play Billing rather than a third-party processor like Razorpay. So on Android
 * we route money purchases through Play Billing, and everywhere else (iOS, and
 * any other platform) we keep using Razorpay.
 *
 * Free and points-based unlocks are unaffected by this — they always complete
 * server-side regardless of platform.
 */
export type BillingProvider = 'play' | 'razorpay';

export const billingProvider: BillingProvider = Platform.OS === 'android' ? 'play' : 'razorpay';

/**
 * Money purchases are now ENABLED on every platform: Razorpay on non-Android,
 * Google Play Billing on Android. Kept as a derived helper for any UI/code that
 * still references it.
 */
export const moneyPurchasesEnabled = true;
