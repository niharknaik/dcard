import {api} from './client';
import {ApiEnvelope, Card, Service, SocialLink} from '@/types';

export interface CardInput {
  full_name: string;
  designation?: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  about?: string;
  is_published?: boolean;
}

export const cardsApi = {
  async list(search?: string): Promise<Card[]> {
    const {data} = await api.get<ApiEnvelope<Card[]>>('/cards', {params: {search, per_page: 50}});
    return data.data;
  },

  async get(id: number): Promise<Card> {
    const {data} = await api.get<ApiEnvelope<Card>>(`/cards/${id}`);
    return data.data;
  },

  async create(payload: CardInput): Promise<Card> {
    const {data} = await api.post<ApiEnvelope<Card>>('/cards', payload);
    return data.data;
  },

  async update(id: number, payload: Partial<CardInput>): Promise<Card> {
    const {data} = await api.put<ApiEnvelope<Card>>(`/cards/${id}`, payload);
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/cards/${id}`);
  },

  async duplicate(id: number): Promise<Card> {
    const {data} = await api.post<ApiEnvelope<Card>>(`/cards/${id}/duplicate`);
    return data.data;
  },

  async addSocialLink(cardId: number, payload: {platform: string; url: string}): Promise<SocialLink> {
    const {data} = await api.post<ApiEnvelope<SocialLink>>(`/cards/${cardId}/social-links`, payload);
    return data.data;
  },

  async removeSocialLink(linkId: number): Promise<void> {
    await api.delete(`/social-links/${linkId}`);
  },

  async listServices(cardId: number): Promise<Service[]> {
    const {data} = await api.get<ApiEnvelope<Service[]>>(`/cards/${cardId}/services`);
    return data.data;
  },

  async addService(cardId: number, payload: {name: string; description?: string; price?: number}): Promise<Service> {
    const {data} = await api.post<ApiEnvelope<Service>>(`/cards/${cardId}/services`, payload);
    return data.data;
  },

  async removeService(serviceId: number): Promise<void> {
    await api.delete(`/services/${serviceId}`);
  },
};
