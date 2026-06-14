import {api} from './client';
import {AnalyticsSummary, ApiEnvelope} from '@/types';

export const analyticsApi = {
  async summary(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AnalyticsSummary> {
    const {data} = await api.get<ApiEnvelope<AnalyticsSummary>>('/analytics/summary', {
      params: {period},
    });
    return data.data;
  },

  async card(cardId: number, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AnalyticsSummary> {
    const {data} = await api.get<ApiEnvelope<AnalyticsSummary>>(`/cards/${cardId}/analytics`, {
      params: {period},
    });
    return data.data;
  },
};
