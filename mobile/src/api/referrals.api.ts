import {api} from './client';
import {ApiEnvelope, ReferralDashboard, ReferralItem} from '@/types';

export const referralsApi = {
  async dashboard(): Promise<ReferralDashboard> {
    const {data} = await api.get<ApiEnvelope<ReferralDashboard>>('/referrals');
    return data.data;
  },

  async history(): Promise<ReferralItem[]> {
    const {data} = await api.get<ApiEnvelope<ReferralItem[]>>('/referrals/history', {
      params: {per_page: 50},
    });
    return data.data;
  },
};
