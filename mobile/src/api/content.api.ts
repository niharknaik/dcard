import {api} from './client';
import {ApiEnvelope} from '@/types';

export const contentApi = {
  async consent(): Promise<string> {
    const {data} = await api.get<ApiEnvelope<{text: string}>>('/content/consent');
    return data.data.text;
  },
};
