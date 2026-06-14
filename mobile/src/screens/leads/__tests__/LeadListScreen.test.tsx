import React from 'react';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {LeadListScreen} from '@/screens/leads/LeadListScreen';
import {leadsApi} from '@/api/leads.api';
import {Lead} from '@/types';

jest.mock('@/api/leads.api', () => ({
  leadsApi: {
    list: jest.fn(),
    markRead: jest.fn(),
  },
}));

// Run the focus effect once on mount, no NavigationContainer required.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const react = require('react');
    react.useEffect(() => cb(), [cb]);
  },
}));

const leads = leadsApi as jest.Mocked<typeof leadsApi>;

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 1,
    card_id: 10,
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+91 99999 88888',
    message: 'Interested in your services',
    is_read: false,
    created_at: '2024-01-15T00:00:00Z',
    card: {id: 10, full_name: 'Acme', slug: 'acme'},
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  leads.list.mockResolvedValue([]);
  leads.markRead.mockResolvedValue(makeLead({is_read: true}));
});

describe('LeadListScreen', () => {
  it('shows the empty state when there are no leads', async () => {
    renderWithProviders(<LeadListScreen />);

    expect(await screen.findByText('No leads yet')).toBeOnTheScreen();
    expect(screen.getByText('Leads from your cards appear here.')).toBeOnTheScreen();
  });

  it('renders the lead details and a "New" chip for unread leads', async () => {
    leads.list.mockResolvedValue([makeLead()]);
    renderWithProviders(<LeadListScreen />);

    expect(await screen.findByText('Jane Doe')).toBeOnTheScreen();
    expect(screen.getByText('jane@example.com')).toBeOnTheScreen();
    expect(screen.getByText('Interested in your services')).toBeOnTheScreen();
    expect(screen.getByText('New')).toBeOnTheScreen();
  });

  it('marks an unread lead read on tap and drops the chip', async () => {
    leads.list.mockResolvedValue([makeLead({id: 7})]);
    renderWithProviders(<LeadListScreen />);

    fireEvent.press(await screen.findByText('Jane Doe'));

    await waitFor(() => expect(leads.markRead).toHaveBeenCalledWith(7));
    await waitFor(() => expect(screen.queryByText('New')).toBeNull());
  });

  it('does not call the API when tapping an already-read lead', async () => {
    leads.list.mockResolvedValue([makeLead({id: 7, is_read: true})]);
    renderWithProviders(<LeadListScreen />);

    fireEvent.press(await screen.findByText('Jane Doe'));

    expect(leads.markRead).not.toHaveBeenCalled();
  });

  it('searches when the searchbar is submitted', async () => {
    renderWithProviders(<LeadListScreen />);
    await waitFor(() => expect(leads.list).toHaveBeenCalled()); // initial load

    const input = screen.getByPlaceholderText('Search leads');
    fireEvent.changeText(input, 'jane');
    fireEvent(input, 'submitEditing');

    await waitFor(() => expect(leads.list).toHaveBeenCalledWith({search: 'jane'}));
  });
});
