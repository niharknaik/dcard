import {api} from './client';
import {ApiEnvelope, Card, Service, SocialLink} from '@/types';

export interface UploadAsset {
  uri: string;
  fileName?: string | null;
  type?: string | null;
}

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

  // Upload profile photo and/or banner as multipart. POST + _method=PUT because
  // PHP can't parse multipart bodies on a real PUT request.
  async uploadImages(cardId: number, files: {profile_photo?: UploadAsset; banner?: UploadAsset}): Promise<Card> {
    const fd = new FormData();
    fd.append('_method', 'PUT');
    const append = (field: string, a?: UploadAsset) => {
      if (a?.uri) {
        fd.append(field, {uri: a.uri, name: a.fileName ?? `${field}.jpg`, type: a.type ?? 'image/jpeg'} as never);
      }
    };
    append('profile_photo', files.profile_photo);
    append('banner', files.banner);
    const {data} = await api.post<ApiEnvelope<Card>>(`/cards/${cardId}`, fd, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data.data;
  },
};
