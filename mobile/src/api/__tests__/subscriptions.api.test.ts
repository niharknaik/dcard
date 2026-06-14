import {subscriptionsApi} from '@/api/subscriptions.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({api: {get: jest.fn(), post: jest.fn()}}));

const http = api as jest.Mocked<typeof api>;
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('subscriptionsApi', () => {
  it('plans() requests /plans and unwraps the array', async () => {
    http.get.mockResolvedValue(envelope([{id: 1, code: 'free'}]));
    const result = await subscriptionsApi.plans();

    expect(http.get).toHaveBeenCalledWith('/plans');
    expect(result).toEqual([{id: 1, code: 'free'}]);
  });

  it('current() requests /subscription', async () => {
    http.get.mockResolvedValue(envelope({plan: {code: 'pro'}, subscription: null}));
    const result = await subscriptionsApi.current();

    expect(http.get).toHaveBeenCalledWith('/subscription');
    expect(result).toEqual({plan: {code: 'pro'}, subscription: null});
  });

  it('checkout() posts the plan id to /subscriptions/checkout', async () => {
    http.post.mockResolvedValue(envelope({order: {id: 'o1'}, razorpay_key: 'k'}));
    const result = await subscriptionsApi.checkout(3);

    expect(http.post).toHaveBeenCalledWith('/subscriptions/checkout', {plan_id: 3});
    expect(result).toEqual({order: {id: 'o1'}, razorpay_key: 'k'});
  });
});
