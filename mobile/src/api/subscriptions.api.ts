import {api} from './client';
import {ApiEnvelope, Plan} from '@/types';

export const subscriptionsApi = {
  async plans(): Promise<Plan[]> {
    const {data} = await api.get<ApiEnvelope<Plan[]>>('/plans');
    return data.data;
  },

  async current(): Promise<{plan: Plan; subscription: unknown}> {
    const {data} = await api.get<ApiEnvelope<{plan: Plan; subscription: unknown}>>('/subscription');
    return data.data;
  },

  async checkout(planId: number): Promise<{order: {id: string; amount: number; currency: string}; razorpay_key: string}> {
    const {data} = await api.post<ApiEnvelope<{order: {id: string; amount: number; currency: string}; razorpay_key: string}>>(
      '/subscriptions/checkout',
      {plan_id: planId},
    );
    return data.data;
  },
};
