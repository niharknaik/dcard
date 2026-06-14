import RazorpayCheckout from 'react-native-razorpay';
import {paymentsApi} from '@/api/payments.api';
import {templatesApi} from '@/api/templates.api';
import {Plan, Template, TemplateUnlockMethod, User} from '@/types';

export class CheckoutCancelled extends Error {
  constructor() {
    super('Payment cancelled.');
    this.name = 'CheckoutCancelled';
  }
}

/**
 * Full purchase flow: create order on the server, open the Razorpay sheet, then
 * verify the signature server-side (which activates the subscription).
 */
export async function purchasePlan(plan: Plan, user: User | null): Promise<void> {
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
 * call; money/mixed unlocks open Razorpay and then verify. Returns true when the
 * template ends up unlocked.
 */
export async function unlockTemplate(
  template: Template,
  method: TemplateUnlockMethod,
  user: User | null,
): Promise<boolean> {
  const result = await templatesApi.unlock(template.id, method);

  if (!result.requires_payment || !result.order || !result.razorpay_key) {
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
