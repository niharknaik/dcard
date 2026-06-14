import {api} from './client';
import {ApiEnvelope, RewardTransaction, RewardWallet} from '@/types';

export const rewardsApi = {
  async wallet(): Promise<RewardWallet> {
    const {data} = await api.get<ApiEnvelope<RewardWallet>>('/rewards/wallet');
    return data.data;
  },

  async transactions(): Promise<RewardTransaction[]> {
    const {data} = await api.get<ApiEnvelope<RewardTransaction[]>>('/rewards/transactions', {
      params: {per_page: 50},
    });
    return data.data;
  },

  async redeem(points: number, description?: string): Promise<{wallet: RewardWallet; transaction: RewardTransaction}> {
    const {data} = await api.post<ApiEnvelope<{wallet: RewardWallet; transaction: RewardTransaction}>>(
      '/rewards/redeem',
      {points, description},
    );
    return data.data;
  },
};
