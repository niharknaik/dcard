import {purchasePlan, CheckoutCancelled} from '@/lib/razorpay';
import {apiFetch} from '@/lib/api-client';
import type {Plan} from '@/lib/types';

jest.mock('@/lib/api-client', () => ({apiFetch: jest.fn()}));

const mockApi = apiFetch as jest.Mock;

const plan: Plan = {
  id: 2,
  name: 'Premium',
  code: 'premium',
  description: null,
  price: 299,
  currency: 'INR',
  billing_period: 'monthly',
  features: [],
  unlimited_cards: true,
};

// Fake Razorpay SDK whose open() resolves or cancels based on `behavior`.
let behavior: 'success' | 'dismiss' = 'success';

class FakeRazorpay {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public opts: any) {}
  on() {}
  open() {
    if (behavior === 'success') {
      this.opts.handler({
        razorpay_order_id: 'order_1',
        razorpay_payment_id: 'pay_1',
        razorpay_signature: 'sig_1',
      });
    } else {
      this.opts.modal.ondismiss();
    }
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  behavior = 'success';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Razorpay = FakeRazorpay;
});

describe('purchasePlan', () => {
  it('creates an order, opens checkout, then verifies the signature', async () => {
    mockApi
      .mockResolvedValueOnce({order: {id: 'order_1', amount: 29900, currency: 'INR'}, razorpay_key: 'rzp_test'})
      .mockResolvedValueOnce(undefined);

    await purchasePlan(plan, {email: 'jane@acme.co'});

    expect(mockApi).toHaveBeenNthCalledWith(1, '/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({plan_id: 2}),
    });
    expect(mockApi).toHaveBeenNthCalledWith(2, '/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 'order_1',
        razorpay_payment_id: 'pay_1',
        razorpay_signature: 'sig_1',
      }),
    });
  });

  it('throws CheckoutCancelled and skips verify when dismissed', async () => {
    behavior = 'dismiss';
    mockApi.mockResolvedValueOnce({order: {id: 'order_1', amount: 29900, currency: 'INR'}, razorpay_key: 'k'});

    await expect(purchasePlan(plan)).rejects.toBeInstanceOf(CheckoutCancelled);
    expect(mockApi).toHaveBeenCalledTimes(1); // verify not called
  });
});
