import {apiFetch} from './api-client';
import type {Plan, Template, TemplateUnlockMethod, UnlockResult} from './types';

interface CheckoutOrder {
  order: {id: string; amount: number; currency: string};
  razorpay_key: string;
}

interface VerifyResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class CheckoutCancelled extends Error {
  constructor() {
    super('Payment cancelled.');
    this.name = 'CheckoutCancelled';
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }
    if ((window as {Razorpay?: unknown}).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Full web checkout: create an order, open Razorpay Checkout, then verify the
 * signature server-side (which activates the subscription). Throws
 * CheckoutCancelled when the user dismisses the sheet.
 */
export async function purchasePlan(
  plan: Plan,
  prefill?: {name?: string; email?: string; contact?: string},
): Promise<void> {
  const ready = await loadRazorpay();
  if (!ready) {
    throw new Error('Could not load the payment gateway. Check your connection.');
  }

  const {order, razorpay_key} = await apiFetch<CheckoutOrder>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({plan_id: plan.id}),
  });

  const result = await new Promise<VerifyResult>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Razorpay = (window as any).Razorpay;
    const rzp = new Razorpay({
      key: razorpay_key,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'DCard',
      description: `${plan.name} plan`,
      prefill,
      theme: {color: '#6366F1'},
      handler: (resp: VerifyResult) => resolve(resp),
      modal: {ondismiss: () => reject(new CheckoutCancelled())},
    });
    rzp.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
    rzp.open();
  });

  await apiFetch('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: result.razorpay_order_id,
      razorpay_payment_id: result.razorpay_payment_id,
      razorpay_signature: result.razorpay_signature,
    }),
  });
}

/**
 * Unlock a marketplace template. Free/points unlocks resolve in a single call;
 * money/mixed unlocks open Razorpay Checkout then verify. Throws
 * CheckoutCancelled when the user dismisses the sheet.
 */
export async function unlockTemplate(
  template: Template,
  method: TemplateUnlockMethod,
  prefill?: {name?: string; email?: string; contact?: string},
): Promise<void> {
  const res = await apiFetch<UnlockResult>(`/templates/${template.id}/unlock`, {
    method: 'POST',
    body: JSON.stringify({method}),
  });

  if (!res.requires_payment || !res.order || !res.razorpay_key) {
    return; // free / points — already complete
  }

  const ready = await loadRazorpay();
  if (!ready) {
    throw new Error('Could not load the payment gateway. Check your connection.');
  }

  const order = res.order;
  const key = res.razorpay_key;
  const result = await new Promise<VerifyResult>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Razorpay = (window as any).Razorpay;
    const rzp = new Razorpay({
      key,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'DCard',
      description: `Template: ${template.name}`,
      prefill,
      theme: {color: '#6366F1'},
      handler: (resp: VerifyResult) => resolve(resp),
      modal: {ondismiss: () => reject(new CheckoutCancelled())},
    });
    rzp.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
    rzp.open();
  });

  await apiFetch('/templates/verify', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: result.razorpay_order_id,
      razorpay_payment_id: result.razorpay_payment_id,
      razorpay_signature: result.razorpay_signature,
    }),
  });
}
