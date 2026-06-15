export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  is_admin: boolean;
  roles?: string[];
}

export interface AuthPayload {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  label?: string | null;
  sort_order: number;
  is_active: boolean;
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
  qr_url: string;
  social_links?: SocialLink[];
  social_links_count?: number;
  leads_count?: number;
}

export interface Lead {
  id: number;
  card_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  is_read: boolean;
  created_at: string;
  card?: {id: number; full_name: string; slug: string};
}

export interface AppNotification {
  id: number;
  type: string;
  type_label: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  card_limit: number;
  unlimited_cards: boolean;
  /** Google Play product/SKU id, used for Play Billing on Android. */
  play_product_id?: string | null;
}

export interface Payment {
  id: number;
  transaction_id: string;
  invoice_number?: string | null;
  amount: number;
  currency: string;
  status: string;
  method?: string | null;
  plan?: {id: number; name: string} | null;
  paid_at?: string | null;
  has_invoice: boolean;
  created_at: string;
}

export interface CheckoutOrder {
  order: {id: string; amount: number; currency: string};
  razorpay_key: string;
}

export type AdPlacement = 'dashboard_top' | 'card_list' | 'leads_top' | 'app_footer';

export interface Ad {
  id: number;
  title: string;
  image: string | null;
  link: string | null;
}

export interface AdsPayload {
  enabled: boolean;
  admob: {
    enabled: boolean;
    android_banner_unit_id: string | null;
    ios_banner_unit_id: string | null;
  };
  placements: Record<AdPlacement, Ad | null>;
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
  config?: Record<string, unknown> | null;
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
  /** Google Play product/SKU id, used for Play Billing on Android. */
  play_product_id?: string | null;
}

export interface TemplatePurchase {
  id: number;
  template_id: number;
  template?: Template;
  unlock_method: TemplateUnlockMethod;
  amount: number;
  currency: string;
  points_spent: number;
  status: 'pending' | 'completed' | 'failed';
  razorpay_order_id?: string | null;
  paid_at?: string | null;
  created_at: string;
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
  updated_at?: string | null;
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
  rewarded_at?: string | null;
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
