import React from 'react';
import {renderWithProviders, screen} from '@/test-utils/render';
import {PaymentHistoryScreen} from '@/screens/profile/PaymentHistoryScreen';
import {paymentsApi} from '@/api/payments.api';
import {Payment} from '@/types';

jest.mock('@/api/payments.api', () => ({
  paymentsApi: {
    history: jest.fn(),
  },
}));

// Run the focus effect once on mount, no NavigationContainer required.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const react = require('react');
    react.useEffect(() => cb(), [cb]);
  },
}));

const payments = paymentsApi as jest.Mocked<typeof paymentsApi>;

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    transaction_id: 'txn_abc123',
    invoice_number: 'INV-001',
    amount: 499,
    currency: 'INR',
    status: 'paid',
    method: 'card',
    plan: {id: 2, name: 'Pro'},
    paid_at: '2024-02-01T00:00:00Z',
    has_invoice: true,
    created_at: '2024-01-31T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PaymentHistoryScreen', () => {
  it('shows the empty state when there are no payments', async () => {
    payments.history.mockResolvedValue([]);
    renderWithProviders(<PaymentHistoryScreen />);

    expect(await screen.findByText('No payments yet')).toBeOnTheScreen();
    expect(screen.getByText('Your subscription payments appear here.')).toBeOnTheScreen();
  });

  it('renders amount, plan, invoice number and status for a payment', async () => {
    payments.history.mockResolvedValue([makePayment()]);
    renderWithProviders(<PaymentHistoryScreen />);

    expect(await screen.findByText(/499/)).toBeOnTheScreen();
    expect(screen.getByText('Pro plan')).toBeOnTheScreen();
    expect(screen.getByText('INV-001')).toBeOnTheScreen();
    expect(screen.getByText('paid')).toBeOnTheScreen();
    expect(screen.queryByText('No payments yet')).toBeNull();
  });

  it('falls back to the transaction id when there is no invoice number', async () => {
    payments.history.mockResolvedValue([
      makePayment({id: 9, invoice_number: null, status: 'failed'}),
    ]);
    renderWithProviders(<PaymentHistoryScreen />);

    expect(await screen.findByText('txn_abc123')).toBeOnTheScreen();
    expect(screen.getByText('failed')).toBeOnTheScreen();
  });

  it('renders a row per payment', async () => {
    payments.history.mockResolvedValue([
      makePayment({id: 1, transaction_id: 'txn_1', invoice_number: 'INV-1'}),
      makePayment({id: 2, transaction_id: 'txn_2', invoice_number: 'INV-2'}),
    ]);
    renderWithProviders(<PaymentHistoryScreen />);

    expect(await screen.findByText('INV-1')).toBeOnTheScreen();
    expect(screen.getByText('INV-2')).toBeOnTheScreen();
  });
});
