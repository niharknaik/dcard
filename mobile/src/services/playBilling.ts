import {Platform} from 'react-native';
import {
  Purchase,
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  requestSubscription,
} from 'react-native-iap';
import type {EmitterSubscription} from 'react-native';
import {CheckoutCancelled} from './errors';

/**
 * Thin wrapper around react-native-iap for Google Play Billing.
 *
 * Flow for a money purchase on Android:
 *   1. initBilling()
 *   2. purchaseSubscription(productId) / purchaseProduct(productId)
 *        -> requests the purchase and resolves with {purchaseToken, productId}
 *   3. send the token to OUR backend (paymentsApi.verifyPlay / templatesApi.verifyPlay)
 *   4. only AFTER the server confirms, call finishPurchase(purchase, {isConsumable})
 *      to acknowledge (subscriptions + non-consumable template unlocks) the
 *      transaction with Google. Acknowledging before server verification risks
 *      granting entitlement for an unverified purchase; not acknowledging within
 *      3 days causes Google to auto-refund.
 *
 * On non-Android platforms every function is a safe no-op so callers don't have
 * to branch (the Razorpay path is used there instead).
 */

const isAndroid = Platform.OS === 'android';

let connected = false;

/** react-native-iap user-cancelled error code. */
const USER_CANCELLED = 'E_USER_CANCELLED';

export async function initBilling(): Promise<void> {
  if (!isAndroid || connected) {
    return;
  }
  try {
    await initConnection();
    // Clear any failed/pending purchases left over from a previous run so they
    // don't block new purchase requests.
    await flushFailedPurchasesCachedAsPendingAndroid().catch(() => undefined);
    connected = true;
  } catch {
    // Leave `connected` false; callers will surface a clear error when they try
    // to purchase and the connection is unavailable.
    connected = false;
  }
}

export async function endBilling(): Promise<void> {
  if (!isAndroid || !connected) {
    return;
  }
  try {
    await endConnection();
  } finally {
    connected = false;
  }
}

interface PurchaseResult {
  purchaseToken: string;
  productId: string;
  /** The raw purchase, needed later for finishPurchase. */
  purchase: Purchase;
}

/**
 * Wait for the next purchase update (or error) for `productId` after kicking off
 * a request. react-native-iap delivers the completed purchase through the
 * purchaseUpdatedListener rather than (reliably) the requestPurchase promise on
 * Android, so we listen and correlate by product id.
 */
function awaitPurchase(
  productId: string,
  trigger: () => Promise<unknown>,
): Promise<PurchaseResult> {
  // Safety net: if neither the update nor the error listener ever fires (e.g.
  // the user abandons the Play sheet without cancelling), reject and remove the
  // listeners so they don't leak for the app's lifetime.
  const PURCHASE_TIMEOUT_MS = 10 * 60 * 1000;

  return new Promise<PurchaseResult>((resolve, reject) => {
    let settled = false;
    let updateSub: EmitterSubscription | undefined;
    let errorSub: EmitterSubscription | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      updateSub?.remove();
      errorSub?.remove();
      if (timer) {
        clearTimeout(timer);
      }
    };

    timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error('Google Play purchase timed out. Please try again.'));
    }, PURCHASE_TIMEOUT_MS);

    updateSub = purchaseUpdatedListener((purchase: Purchase) => {
      if (settled) {
        return;
      }
      if (purchase.productId !== productId) {
        return;
      }
      const token = purchase.purchaseToken;
      if (!token) {
        // A pending purchase (e.g. awaiting a slow form of payment) arrives
        // without a usable token; keep listening.
        return;
      }
      settled = true;
      cleanup();
      resolve({purchaseToken: token, productId: purchase.productId, purchase});
    });

    errorSub = purchaseErrorListener((error: {code?: string; message?: string}) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      if (error?.code === USER_CANCELLED) {
        reject(new CheckoutCancelled());
        return;
      }
      reject(new Error(error?.message ?? 'Google Play purchase failed.'));
    });

    trigger().catch((error: {code?: string; message?: string}) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      if (error?.code === USER_CANCELLED) {
        reject(new CheckoutCancelled());
        return;
      }
      reject(new Error(error?.message ?? 'Google Play purchase failed.'));
    });
  });
}

export async function purchaseSubscription(productId: string): Promise<PurchaseResult> {
  await initBilling();
  // Google Play requires a concrete offer token (not just the product id) to
  // purchase a subscription. Look up the product's first available offer.
  const subs = await getSubscriptions({skus: [productId]});
  const sub = subs.find(s => s.productId === productId) ?? subs[0];
  const offerToken =
    sub && 'subscriptionOfferDetails' in sub
      ? sub.subscriptionOfferDetails?.[0]?.offerToken
      : undefined;
  if (!offerToken) {
    throw new Error('This subscription is not available for purchase right now.');
  }
  return awaitPurchase(productId, () =>
    requestSubscription({subscriptionOffers: [{sku: productId, offerToken}]}),
  );
}

export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  await initBilling();
  // Android's requestPurchase requires `skus` (an array), not `sku`.
  return awaitPurchase(productId, () => requestPurchase({skus: [productId]}));
}

/**
 * Acknowledge (and optionally consume) a purchase with Google. Call this ONLY
 * after our server has verified the purchase token.
 *
 * - Subscriptions: acknowledge, don't consume (isConsumable = false).
 * - Template unlocks: non-consumable, acknowledge only (isConsumable = false).
 */
export async function finishPurchase(
  purchase: Purchase,
  {isConsumable = false}: {isConsumable?: boolean} = {},
): Promise<void> {
  if (!isAndroid) {
    return;
  }
  await finishTransaction({purchase, isConsumable});
}
