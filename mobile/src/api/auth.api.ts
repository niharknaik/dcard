import {api} from './client';
import {ApiEnvelope, AuthPayload, User} from '@/types';

export const authApi = {
  async register(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    referral_code?: string;
    accept_terms: boolean;
  }): Promise<AuthPayload> {
    const {data} = await api.post<ApiEnvelope<AuthPayload>>('/auth/register', payload);
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthPayload> {
    const {data} = await api.post<ApiEnvelope<AuthPayload>>('/auth/login', {email, password});
    return data.data;
  },

  async me(): Promise<User> {
    const {data} = await api.get<ApiEnvelope<User>>('/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<string> {
    const {data} = await api.post<ApiEnvelope<null>>('/auth/forgot-password', {email});
    return data.message;
  },

  async updateProfile(payload: {name?: string; phone?: string; email?: string}): Promise<User> {
    const {data} = await api.put<ApiEnvelope<User>>('/profile', payload);
    return data.data;
  },

  async changePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await api.put('/password', payload);
  },
};
