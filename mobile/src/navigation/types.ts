import {Card} from '@/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type CardsStackParamList = {
  CardList: undefined;
  CardEditor: {cardId?: number} | undefined;
  QrShare: {card: Card};
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Plans: undefined;
  PaymentHistory: undefined;
  RewardWallet: undefined;
  Referrals: undefined;
};

export type MarketplaceStackParamList = {
  TemplateMarketplace: undefined;
  TemplateDetail: {templateId: number};
};

export type AppTabParamList = {
  Dashboard: undefined;
  Cards: undefined;
  Templates: undefined;
  Leads: undefined;
  Notifications: undefined;
  Profile: undefined;
};
