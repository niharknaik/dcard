import RazorpayCheckout from 'react-native-razorpay';
import {purchasePlan, CheckoutCancelled} from '@/services/checkout';
import {paymentsApi} from '@/api/payments.api';
import {Plan, User} from '@/types';

jest.mock('@/api/payments.api', () => ({
  paymentsApi: {
    checkout: jest.fn(),
    verify: jest.fn(),
  },
}));

const checkoutMock = paymentsApi.checkout as jest.Mock;
const verifyMock = paymentsApi.verify as jest.Mock;
const openMock = RazorpayCheckout.open as jest.Mock;

const plan: Plan = {
  id: 7,
  name: 'Pro',
  code: 'pro',
  price: 499,
  currency: 'INR',
  billing_period: 'monthly',
  features: [],
  card_limit: 10,
  unlimited_cards: false,
};

const user: User = {
  id: 1,
  name: 'Jane',
  email: 'jane@example.com',
  phone: '+919999999999',
  status: 'active',
  is_admin: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  checkoutMock.mockResolvedValue({
    order: {id: 'order_123', amount: 49900, currency: 'INR'},
    razorpay_key: 'rzp_test_key',
  });
});

describe('purchasePlan', () => {
  it('creates an order, opens the sheet, then verifies the signature', async () => {
    openMock.mockResolvedValue({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_456',
      razorpay_signature: 'sig_789',
    });

    await purchasePlan(plan, user);

    expect(checkoutMock).toHaveBeenCalledWith(7);
    expect(openMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'rzp_test_key',
        order_id: 'order_123',
        amount: 49900,
        currency: 'INR',
        prefill: expect.objectContaining({email: 'jane@example.com'}),
      }),
    );
    expect(verifyMock).toHaveBeenCalledWith({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_456',
      razorpay_signature: 'sig_789',
    });
  });

  it('throws CheckoutCancelled and skips verification when the user dismisses the sheet', async () => {
    openMock.mockRejectedValue({code: 0, description: 'cancelled'});

    await expect(purchasePlan(plan, user)).rejects.toBeInstanceOf(CheckoutCancelled);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('tolerates a null user (no prefill data)', async () => {
    openMock.mockResolvedValue({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_456',
      razorpay_signature: 'sig_789',
    });

    await purchasePlan(plan, null);

    expect(openMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prefill: {email: undefined, contact: undefined, name: undefined},
      }),
    );
    expect(verifyMock).toHaveBeenCalled();
  });
});
