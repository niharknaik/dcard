import {api} from './client';
import {AdsPayload, ApiEnvelope} from '@/types';

export const adsApi = {
  async get(): Promise<AdsPayload> {
    const {data} = await api.get<ApiEnvelope<AdsPayload>>('/ads');
    return data.data;
  },

  async track(adId: number, event: 'impression' | 'click'): Promise<void> {
    await api.post(`/ads/${adId}/track`, {event});
  },
};
