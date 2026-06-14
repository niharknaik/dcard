import {api} from './client';
import {ApiEnvelope, Lead} from '@/types';

export const leadsApi = {
  async list(params?: {search?: string; is_read?: boolean}): Promise<Lead[]> {
    const {data} = await api.get<ApiEnvelope<Lead[]>>('/leads', {
      params: {...params, per_page: 50},
    });
    return data.data;
  },

  async markRead(id: number): Promise<Lead> {
    const {data} = await api.patch<ApiEnvelope<Lead>>(`/leads/${id}/read`);
    return data.data;
  },
};
