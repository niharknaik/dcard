import {api} from './client';
import {ApiEnvelope, CheckoutOrder, Payment} from '@/types';

export interface VerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  async checkout(planId: number): Promise<CheckoutOrder> {
    const {data} = await api.post<ApiEnvelope<CheckoutOrder>>('/subscriptions/checkout', {plan_id: planId});
    return data.data;
  },

  async verify(payload: VerifyPayload): Promise<Payment> {
    const {data} = await api.post<ApiEnvelope<Payment>>('/payments/verify', payload);
    return data.data;
  },

  async history(): Promise<Payment[]> {
    const {data} = await api.get<ApiEnvelope<Payment[]>>('/payments', {params: {per_page: 50}});
    return data.data;
  },
};
