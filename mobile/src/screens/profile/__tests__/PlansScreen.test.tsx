import React from 'react';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {PlansScreen} from '@/screens/profile/PlansScreen';
import {subscriptionsApi} from '@/api/subscriptions.api';
import {purchasePlan, CheckoutCancelled} from '@/services/checkout';
import {Plan, User} from '@/types';

const user: User = {
  id: 1,
  name: 'Jane',
  email: 'jane@example.com',
  status: 'active',
  is_admin: false,
};

jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: {user: User}) => unknown) => selector({user}),
}));

jest.mock('@/api/subscriptions.api', () => ({
  subscriptionsApi: {
    plans: jest.fn(),
    current: jest.fn(),
  },
}));

// Keep the real CheckoutCancelled class (used in an instanceof check) but stub
// the network-driven purchase flow.
jest.mock('@/services/checkout', () => ({
  ...jest.requireActual('@/services/checkout'),
  purchasePlan: jest.fn(),
}));

// Run the focus effect once on mount, no NavigationContainer required.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const react = require('react');
    react.useEffect(() => cb(), [cb]);
  },
}));

const subs = subscriptionsApi as jest.Mocked<typeof subscriptionsApi>;
const mockPurchase = purchasePlan as jest.Mock;

function plan(overrides: Partial<Plan>): Plan {
  return {
    id: 0,
    name: '',
    code: '',
    price: 0,
    currency: 'INR',
    billing_period: 'month',
    features: [],
    card_limit: 1,
    unlimited_cards: false,
    ...overrides,
  };
}

const free = plan({id: 1, name: 'Free', code: 'free', price: 0, features: ['1 card']});
const pro = plan({id: 2, name: 'Pro', code: 'pro', price: 499, features: ['10 cards', 'Analytics']});
const business = plan({id: 3, name: 'Business', code: 'business', price: 999, features: ['Unlimited']});

beforeEach(() => {
  jest.clearAllMocks();
  subs.plans.mockResolvedValue([free, pro, business]);
  // User is currently on the free plan.
  subs.current.mockResolvedValue({plan: free, subscription: null});
});

describe('PlansScreen', () => {
  it('lists plans, marks the current one, and shows Upgrade only for other paid plans', async () => {
    renderWithProviders(<PlansScreen />);

    expect(await screen.findByText('Pro')).toBeOnTheScreen();
    expect(screen.getByText('Business')).toBeOnTheScreen();
    // "Free" appears twice for the free plan: its name and its (price 0) label.
    expect(screen.getAllByText('Free')).toHaveLength(2);

    // Free is the current plan → a "Current" chip, no Upgrade button.
    expect(screen.getByText('Current')).toBeOnTheScreen();
    // Pro (₹499) and Business (₹999) are upgradable.
    expect(screen.getAllByText('Upgrade')).toHaveLength(2);
    expect(screen.getByText(/499/)).toBeOnTheScreen();
  });

  it('purchases the chosen plan and confirms activation', async () => {
    mockPurchase.mockResolvedValue(undefined);
    renderWithProviders(<PlansScreen />);

    fireEvent.press((await screen.findAllByText('Upgrade'))[0]); // Pro

    await waitFor(() => expect(mockPurchase).toHaveBeenCalledTimes(1));
    expect(mockPurchase).toHaveBeenCalledWith(expect.objectContaining({id: pro.id}), user);
    expect(await screen.findByText('Subscription activated.')).toBeOnTheScreen();
    // Success triggers a reload of plans + current.
    expect(subs.plans).toHaveBeenCalledTimes(2);
  });

  it('stays silent when the user cancels the checkout sheet', async () => {
    mockPurchase.mockRejectedValue(new CheckoutCancelled());
    renderWithProviders(<PlansScreen />);

    fireEvent.press((await screen.findAllByText('Upgrade'))[0]);

    await waitFor(() => expect(mockPurchase).toHaveBeenCalled());
    // No success and no error message after a cancellation.
    expect(screen.queryByText('Subscription activated.')).toBeNull();
    expect(screen.queryByText('Something went wrong. Please try again.')).toBeNull();
  });

  it('surfaces an error message when the purchase fails', async () => {
    mockPurchase.mockRejectedValue(new Error('boom'));
    renderWithProviders(<PlansScreen />);

    fireEvent.press((await screen.findAllByText('Upgrade'))[0]);

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeOnTheScreen();
  });
});
