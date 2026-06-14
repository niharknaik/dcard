import {paymentsApi} from '@/api/payments.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({api: {get: jest.fn(), post: jest.fn()}}));

const http = api as jest.Mocked<typeof api>;
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('paymentsApi', () => {
  it('checkout() posts the plan id to /subscriptions/checkout', async () => {
    http.post.mockResolvedValue(envelope({order: {id: 'o1'}, razorpay_key: 'k'}));
    const result = await paymentsApi.checkout(3);

    expect(http.post).toHaveBeenCalledWith('/subscriptions/checkout', {plan_id: 3});
    expect(result).toEqual({order: {id: 'o1'}, razorpay_key: 'k'});
  });

  it('verify() posts the signature payload to /payments/verify', async () => {
    http.post.mockResolvedValue(envelope({id: 1, status: 'paid'}));
    const payload = {
      razorpay_order_id: 'o1',
      razorpay_payment_id: 'p1',
      razorpay_signature: 's1',
    };
    const result = await paymentsApi.verify(payload);

    expect(http.post).toHaveBeenCalledWith('/payments/verify', payload);
    expect(result).toEqual({id: 1, status: 'paid'});
  });

  it('history() requests /payments with per_page', async () => {
    http.get.mockResolvedValue(envelope([{id: 1}]));
    const result = await paymentsApi.history();

    expect(http.get).toHaveBeenCalledWith('/payments', {params: {per_page: 50}});
    expect(result).toEqual([{id: 1}]);
  });
});
