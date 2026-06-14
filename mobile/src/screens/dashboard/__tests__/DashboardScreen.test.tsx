import React from 'react';
import {renderWithProviders, screen} from '@/test-utils/render';
import {DashboardScreen} from '@/screens/dashboard/DashboardScreen';
import {analyticsApi} from '@/api/analytics.api';
import {cardsApi} from '@/api/cards.api';
import {AnalyticsSummary, Card, User} from '@/types';

let mockUser: User | null;
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: {user: User | null}) => unknown) => selector({user: mockUser}),
}));

jest.mock('@/api/analytics.api', () => ({analyticsApi: {summary: jest.fn()}}));
jest.mock('@/api/cards.api', () => ({cardsApi: {list: jest.fn()}}));

// Run the focus effect once on mount, no NavigationContainer required.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const react = require('react');
    react.useEffect(() => cb(), [cb]);
  },
}));

const analytics = analyticsApi as jest.Mocked<typeof analyticsApi>;
const cards = cardsApi as jest.Mocked<typeof cardsApi>;

function summary(totals: Partial<AnalyticsSummary['totals']>): AnalyticsSummary {
  return {
    period: 'daily',
    totals: {
      views: 0,
      unique_visitors: 0,
      qr_scans: 0,
      contact_saves: 0,
      link_clicks: 0,
      portfolio_clicks: 0,
      ...totals,
    },
    series: [],
  };
}

const aCard = {id: 1} as Card;

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = {id: 1, name: 'Jane Doe', email: 'jane@example.com', status: 'active', is_admin: false};
  analytics.summary.mockResolvedValue(summary({}));
  cards.list.mockResolvedValue([]);
});

describe('DashboardScreen', () => {
  it('greets the user by first name and renders the analytics totals', async () => {
    cards.list.mockResolvedValue([aCard, aCard, aCard]); // 3 cards
    analytics.summary.mockResolvedValue(
      summary({views: 100, unique_visitors: 40, qr_scans: 10, link_clicks: 5, contact_saves: 2}),
    );
    renderWithProviders(<DashboardScreen />);

    expect(screen.getByText(/Hi, Jane/)).toBeOnTheScreen();
    // Stat values appear after load resolves.
    expect(await screen.findByText('3')).toBeOnTheScreen(); // Cards
    expect(screen.getByText('100')).toBeOnTheScreen(); // Views
    expect(screen.getByText('40')).toBeOnTheScreen(); // Unique visitors
    expect(screen.getByText('10')).toBeOnTheScreen(); // QR scans
    expect(screen.getByText('5')).toBeOnTheScreen(); // Link clicks
    expect(screen.getByText('2')).toBeOnTheScreen(); // Contact saves
    expect(analytics.summary).toHaveBeenCalledWith('daily');
  });

  it('requests the daily summary on mount', async () => {
    renderWithProviders(<DashboardScreen />);
    expect(await screen.findByText(/Hi, Jane/)).toBeOnTheScreen();
    expect(analytics.summary).toHaveBeenCalledWith('daily');
    expect(cards.list).toHaveBeenCalled();
  });

  it('falls back to a generic greeting when there is no user', async () => {
    mockUser = null;
    renderWithProviders(<DashboardScreen />);
    expect(await screen.findByText(/Hi, there/)).toBeOnTheScreen();
  });
});
