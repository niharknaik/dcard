import {api} from './client';
import {
  ApiEnvelope,
  Card,
  Template,
  TemplateCategory,
  TemplatePurchase,
  TemplateUnlockMethod,
  UnlockResult,
} from '@/types';

export interface TemplateFilters {
  category_id?: number;
  category?: string;
  is_free?: boolean;
  search?: string;
}

export const templatesApi = {
  async categories(): Promise<TemplateCategory[]> {
    const {data} = await api.get<ApiEnvelope<TemplateCategory[]>>('/templates/categories');
    return data.data;
  },

  async list(filters: TemplateFilters = {}): Promise<Template[]> {
    const {data} = await api.get<ApiEnvelope<Template[]>>('/templates', {
      params: {...filters, per_page: 50},
    });
    return data.data;
  },

  async get(id: number): Promise<Template> {
    const {data} = await api.get<ApiEnvelope<Template>>(`/templates/${id}`);
    return data.data;
  },

  async mine(): Promise<TemplatePurchase[]> {
    const {data} = await api.get<ApiEnvelope<TemplatePurchase[]>>('/templates/mine', {
      params: {per_page: 50},
    });
    return data.data;
  },

  async unlock(id: number, method: TemplateUnlockMethod): Promise<UnlockResult> {
    const {data} = await api.post<ApiEnvelope<UnlockResult>>(`/templates/${id}/unlock`, {method});
    return data.data;
  },

  async verify(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<TemplatePurchase> {
    const {data} = await api.post<ApiEnvelope<TemplatePurchase>>('/templates/verify', payload);
    return data.data;
  },

  async verifyPlay(payload: {
    purchase_token: string;
    product_id: string;
    template_id: number;
    method?: TemplateUnlockMethod;
  }): Promise<TemplatePurchase> {
    const {data} = await api.post<ApiEnvelope<TemplatePurchase>>('/templates/play/verify', payload);
    return data.data;
  },

  async apply(templateId: number, cardId: number, color?: string): Promise<Card> {
    const {data} = await api.post<ApiEnvelope<Card>>(
      `/templates/${templateId}/apply`,
      color ? {card_id: cardId, color} : {card_id: cardId},
    );
    return data.data;
  },
};
