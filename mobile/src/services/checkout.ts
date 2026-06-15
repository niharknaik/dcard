import RazorpayCheckout from 'react-native-razorpay';
import {paymentsApi} from '@/api/payments.api';
import {templatesApi} from '@/api/templates.api';
import {billingProvider} from '@/config/purchases';
import {Plan, Template, TemplateUnlockMethod, User} from '@/types';
import {CheckoutCancelled} from './errors';
import {
  finishPurchase,
  purchaseProduct,
  purchaseSubscription,
} from './playBilling';

// Re-exported so existing callers (PlansScreen, TemplateDetailScreen) keep
// importing CheckoutCancelled from '@/services/checkout' unchanged.
export {CheckoutCancelled};

/**
 * Full purchase flow for a subscription plan.
 *
 * Android: route through Google Play Billing, then verify the purchase token
 * server-side (which activates the subscription), then acknowledge with Google.
 * Other platforms: create a Razorpay order, open the sheet, then verify.
 */
export async function purchasePlan(plan: Plan, user: User | null): Promise<void> {
  if (billingProvider === 'play') {
    if (!plan.play_product_id) {
      throw new Error('This plan is not available for purchase on Android yet.');
    }

    const {purchaseToken, productId, purchase} = await purchaseSubscription(plan.play_product_id);

    await paymentsApi.verifyPlay({purchase_token: purchaseToken, product_id: productId});

    // Server confirmed — acknowledge with Google (subscriptions are not consumed).
    await finishPurchase(purchase, {isConsumable: false});
    return;
  }

  const {order, razorpay_key} = await paymentsApi.checkout(plan.id);

  let result;
  try {
    result = await RazorpayCheckout.open({
      key: razorpay_key,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'DCard',
      description: `${plan.name} plan`,
      prefill: {
        email: user?.email,
        contact: user?.phone ?? undefined,
        name: user?.name,
      },
      theme: {color: '#4f46e5'},
    });
  } catch {
    // The SDK rejects when the user dismisses the sheet.
    throw new CheckoutCancelled();
  }

  await paymentsApi.verify({
    razorpay_order_id: result.razorpay_order_id,
    razorpay_payment_id: result.razorpay_payment_id,
    razorpay_signature: result.razorpay_signature,
  });
}

/**
 * Unlock a marketplace template. Free/points unlocks complete server-side in one
 * call (on every platform). Money/mixed unlocks go through Play Billing on
 * Android and Razorpay elsewhere. Returns true when the template ends up
 * unlocked.
 */
export async function unlockTemplate(
  template: Template,
  method: TemplateUnlockMethod,
  user: User | null,
): Promise<boolean> {
  const result = await templatesApi.unlock(template.id, method);

  if (!result.requires_payment) {
    // Free/points unlock — completed server-side, no payment provider involved.
    return true;
  }

  if (billingProvider === 'play') {
    if (!template.play_product_id) {
      throw new Error('This template is not available for purchase on Android yet.');
    }

    const {purchaseToken, productId, purchase} = await purchaseProduct(template.play_product_id);

    await templatesApi.verifyPlay({
      purchase_token: purchaseToken,
      product_id: productId,
      template_id: template.id,
      method,
    });

    // Server confirmed — acknowledge (template unlocks are non-consumable).
    await finishPurchase(purchase, {isConsumable: false});
    return true;
  }

  // Razorpay path (non-Android).
  if (!result.order || !result.razorpay_key) {
    return true;
  }

  let result2;
  try {
    result2 = await RazorpayCheckout.open({
      key: result.razorpay_key,
      order_id: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      name: 'DCard',
      description: `Template: ${template.name}`,
      prefill: {
        email: user?.email,
        contact: user?.phone ?? undefined,
        name: user?.name,
      },
      theme: {color: '#4f46e5'},
    });
  } catch {
    throw new CheckoutCancelled();
  }

  await templatesApi.verify({
    razorpay_order_id: result2.razorpay_order_id,
    razorpay_payment_id: result2.razorpay_payment_id,
    razorpay_signature: result2.razorpay_signature,
  });

  return true;
}
