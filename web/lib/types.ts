export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  is_admin: boolean;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  label: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface AuthPayload {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface Card {
  id: number;
  slug: string;
  full_name: string;
  profile_photo?: string | null;
  designation?: string | null;
  company?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  about?: string | null;
  is_published: boolean;
  is_default: boolean;
  views_count: number;
  public_url: string;
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

export interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  is_read: boolean;
  created_at: string;
  card?: {id: number; full_name: string; slug: string};
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string | null;
  type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  description: string | null;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  unlimited_cards: boolean;
}

export interface CurrentSubscription {
  plan: Plan | null;
  subscription: unknown;
}

export interface AnalyticsSummary {
  period: string;
  totals: {
    views: number;
    unique_visitors: number;
    qr_scans: number;
    contact_saves: number;
    link_clicks: number;
    portfolio_clicks: number;
  };
  series: Array<{date: string; views: number; unique_visitors: number}>;
}

// ---------------- Template Marketplace ----------------

export interface TemplateCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  templates_count?: number;
}

export type TemplateUnlockMethod = 'free' | 'points' | 'money' | 'mixed';

export interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  category?: TemplateCategory | null;
  thumbnail?: string | null;
  preview_images: string[];
  layout: string;
  color_scheme?: string | null;
  font_family?: string | null;
  price: number;
  currency: string;
  price_points: number;
  is_free: boolean;
  has_portfolio: boolean;
  has_contact: boolean;
  has_social: boolean;
  is_unlocked: boolean;
  purchases_count: number;
  usage_count: number;
}

export interface TemplatePurchase {
  id: number;
  template_id: number;
  template?: Template;
  unlock_method: TemplateUnlockMethod;
  amount: number;
  points_spent: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface UnlockResult {
  status: 'completed' | 'pending';
  requires_payment: boolean;
  purchase: TemplatePurchase;
  order?: {id: string; amount: number; currency: string} | null;
  razorpay_key?: string | null;
}

// ---------------- Rewards & Referrals ----------------

export interface RewardWallet {
  balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
}

export interface RewardTransaction {
  id: number;
  type: 'credit' | 'debit';
  source: string;
  source_label: string;
  points: number;
  signed_points: number;
  balance_after: number;
  description?: string | null;
  created_at: string;
}

export interface ReferralItem {
  id: number;
  points_awarded: number;
  status: string;
  created_at: string;
  referred?: {id: number; name: string; email: string; created_at: string};
}

export interface ReferralDashboard {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  total_points_earned: number;
  referrals: ReferralItem[];
}
