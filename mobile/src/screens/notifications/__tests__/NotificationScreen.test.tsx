import React from 'react';
import {fireEvent, renderWithProviders, screen} from '@/test-utils/render';
import {NotificationScreen} from '@/screens/notifications/NotificationScreen';
import {AppNotification} from '@/types';

// Mutable store state the mocked hook returns; reset in beforeEach.
let mockState: {
  items: AppNotification[];
  loading: boolean;
  unreadCount: number;
  fetch: jest.Mock;
  markRead: jest.Mock;
  markAllRead: jest.Mock;
  remove: jest.Mock;
};

jest.mock('@/store/notification.store', () => ({
  useNotificationStore: () => mockState,
}));

// Run the focus effect once on mount, no NavigationContainer required.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const react = require('react');
    react.useEffect(() => cb(), [cb]);
  },
}));

function note(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 1,
    type: 'new_lead',
    type_label: 'New lead',
    title: 'You have a new lead',
    message: 'Jane Doe wants to connect',
    is_read: false,
    created_at: '2024-01-15T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  mockState = {
    items: [],
    loading: false,
    unreadCount: 0,
    fetch: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    remove: jest.fn(),
  };
});

describe('NotificationScreen', () => {
  it('fetches on mount and shows the empty state when there is nothing', () => {
    renderWithProviders(<NotificationScreen />);

    expect(mockState.fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText("You're all caught up")).toBeOnTheScreen();
    expect(screen.queryByText('Mark all as read')).toBeNull();
  });

  it('renders a row per notification', () => {
    mockState.items = [
      note({id: 1, title: 'First'}),
      note({id: 2, title: 'Second'}),
    ];
    mockState.unreadCount = 2;
    renderWithProviders(<NotificationScreen />);

    expect(screen.getByText('First')).toBeOnTheScreen();
    expect(screen.getByText('Second')).toBeOnTheScreen();
    expect(screen.queryByText("You're all caught up")).toBeNull();
  });

  it('shows "Mark all as read" only when there are unread items and wires it up', () => {
    mockState.items = [note({id: 1, title: 'First'})];
    mockState.unreadCount = 1;
    renderWithProviders(<NotificationScreen />);

    fireEvent.press(screen.getByText('Mark all as read'));
    expect(mockState.markAllRead).toHaveBeenCalledTimes(1);
  });

  it('marks a notification read on tap and removes it via the close button', () => {
    mockState.items = [note({id: 7, title: 'Tap me'})];
    mockState.unreadCount = 1;
    renderWithProviders(<NotificationScreen />);

    fireEvent.press(screen.getByText('Tap me'));
    expect(mockState.markRead).toHaveBeenCalledWith(7);

    // The close IconButton renders its "close" icon as text via the test stub.
    fireEvent.press(screen.getByText('close'));
    expect(mockState.remove).toHaveBeenCalledWith(7);
  });
});
